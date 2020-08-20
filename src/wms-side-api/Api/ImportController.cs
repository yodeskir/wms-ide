using System;
using System.IO;
using System.IO.Compression;
using System.Text;
using System.Threading.Tasks;
using fileManager;
using mapfileManager;
using mapfileManager.Interfaces;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Net.Http.Headers;
using wms_ide.Filters;
using wms_ide.Utils;
using WMSDataAccess.UserManagement;
using wmsShared.Interfaces;
using wmsShared.Model;

namespace wms_ide.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImportController : Controller
    {
        //private readonly IMemoryCache _cache;
        private readonly ILayerDatasourceManager _datasourceManager;
        private readonly IUserManager _userManager;
        private readonly IMapFileManager _mapFileManager;
        private static readonly FormOptions _defaultFormOptions = new FormOptions();
        public ImportController(ILayerDatasourceManager datasourceManager, IUserManager userManager, IMapFileManager mapFileManager)
        {
            _datasourceManager = datasourceManager;
            _mapFileManager = mapFileManager;
            _userManager = userManager;
        }

        [HttpGet]
        public JsonResult Get()
        {
            return Json("Ok?");
        }

        [HttpPost("heatmap")]
        public JsonResult NewHeatMapLayer([FromBody] ImportViewModel importModel)
        {
            var loadingOptions = new MapLoadingOptions()
            {
                MapFileName = importModel.MapName,
                UserName = importModel.UserName
            };

            _userManager.CreateUserLayer(importModel);

            _mapFileManager.InsertLayerFromImport(importModel);

            return Json(_mapFileManager.GetMapFileObj(loadingOptions));
        }

        [HttpPost]
        [DisableFormValueModelBinding]
        public async Task<IActionResult> Post()
        {
            try
            {
                if (!MultipartRequestHelper.IsMultipartContentType(Request.ContentType))
                {
                    return Json($"Expected a multipart request, but got {Request.ContentType}");
                }

                ImportViewModel importModel = await ProcessAndUnzip();
                var mapObj = await _datasourceManager.AddNewLayerFromUpload(importModel);

                return new JsonResult(FromImportViewModelToResultModel(importModel, mapObj));
            }
            catch (Exception ex) {
                return new JsonResult(ex.Message);
            }            
        }

        private static ImportModelResult FromImportViewModelToResultModel(ImportViewModel importModel, IMapfileBlock mapObj)
        {
            return new ImportModelResult()
            {
                Geometry = importModel.Geometry,
                IsValid = importModel.IsValid,
                LayerName = importModel.LayerName,
                MapFile = mapObj,
                Message = importModel.Message,
                NeedsRework = importModel.NeedsRework,
                FinalLayerType = importModel.UploadedLayerType,
                UserName = importModel.UserName
            };
        }

        private async Task<ImportViewModel> ProcessAndUnzip()
        {
            // Used to accumulate all the form url encoded key value pairs in the request.
            var formAccumulator = new KeyValueAccumulator();
            string targetFilePath = null;
            string extractPath = null;
            var boundary = MultipartRequestHelper.GetBoundary(MediaTypeHeaderValue.Parse(Request.ContentType), _defaultFormOptions.MultipartBoundaryLengthLimit);
            var reader = new MultipartReader(boundary, HttpContext.Request.Body);
            var section = await reader.ReadNextSectionAsync();

            while (section != null)
            {
                ContentDispositionHeaderValue contentDisposition;
                var hasContentDispositionHeader = ContentDispositionHeaderValue.TryParse(section.ContentDisposition, out contentDisposition);

                if (hasContentDispositionHeader)
                {
                    if (MultipartRequestHelper.HasFileContentDisposition(contentDisposition))
                    {
                        targetFilePath = Path.GetTempFileName() + contentDisposition.FileName.Value;
                        using (var targetStream = System.IO.File.Create(targetFilePath))
                        {
                            await section.Body.CopyToAsync(targetStream);
                        }
                    }
                    else if (MultipartRequestHelper.HasFormDataContentDisposition(contentDisposition))
                    {
                        // Do not limit the key name length here because the 
                        // multipart headers length limit is already in effect.
                        var key = HeaderUtilities.RemoveQuotes(contentDisposition.Name);
                        var encoding = GetEncoding(section);
                        using (var streamReader = new StreamReader(
                            section.Body,
                            encoding,
                            detectEncodingFromByteOrderMarks: true,
                            bufferSize: 1024,
                            leaveOpen: true))
                        {
                            // The value length limit is enforced by MultipartBodyLengthLimit
                            var value = await streamReader.ReadToEndAsync();
                            if (string.Equals(value, "undefined", StringComparison.OrdinalIgnoreCase))
                            {
                                value = string.Empty;
                            }
                            formAccumulator.Append(key.ToString(), value);

                            if (formAccumulator.ValueCount > _defaultFormOptions.ValueCountLimit)
                            {
                                throw new InvalidDataException($"Form key count limit {_defaultFormOptions.ValueCountLimit} exceeded.");
                            }
                        }
                    }
                }

                // Drains any remaining section body that has not been consumed and
                // reads the headers for the next section.
                section = await reader.ReadNextSectionAsync();
            }

            ExtractUploadedFile(ref targetFilePath, ref extractPath);
            var importModel = GetImportViewModel(formAccumulator, targetFilePath);
            return importModel;
        }

        private static void ExtractUploadedFile(ref string targetFilePath, ref string extractPath)
        {
            if (Path.GetExtension(targetFilePath).Equals(".zip"))
            {
                extractPath = Path.GetFullPath(targetFilePath);
                extractPath = extractPath.Substring(0, extractPath.Length - 4);
                if (!extractPath.EndsWith(Path.DirectorySeparatorChar))
                    extractPath += Path.DirectorySeparatorChar;

                if (!Directory.Exists(extractPath)) Directory.CreateDirectory(extractPath);

                using (ZipFile.OpenRead(targetFilePath))
                {
                    ZipFile.ExtractToDirectory(targetFilePath, extractPath);
                }
                string[] shpfiles = Directory.GetFiles(extractPath, "*.shp");
                targetFilePath = shpfiles[0];
            }
        }

        private static ImportViewModel GetImportViewModel(KeyValueAccumulator formAccumulator, string targetFilePath)
        {
            var importModel = new ImportViewModel();
            importModel.TargetFilePath = targetFilePath;
            importModel.DatasourceName = Path.GetFileNameWithoutExtension(targetFilePath).Trim();
            var kvmodel = formAccumulator.GetResults();
            foreach (var item in kvmodel)
            {
                switch (item.Key.ToLower())
                {
                    case "layertype":
                        importModel.UploadedLayerType = LayerTypeHelper.GetFinalLayerType(LayerType.Autodetect, item.Value, false);
                        break;
                    case "mapname":
                        importModel.MapName = item.Value;
                        break;
                    case "layername":
                        importModel.LayerName = item.Value;
                        break;
                    case "layerdescription":
                        importModel.LayerDescription = item.Value;
                        break;
                    case "projection":
                        importModel.Projection = (string.IsNullOrEmpty(item.Value)) ? "4326" : item.Value.ToString().Split(":")[1];
                        break;
                    case "ispublic":
                        importModel.IsPublic = item.Value;
                        break;
                    case "username":
                        importModel.UserName = item.Value;
                        break;
                    case "numberclasses":
                        importModel.NumberClasses = item.Value;
                        break;
                    case "colorclasses":
                        importModel.ColorClasses = item.Value;
                        break;
                }
            }
            importModel.IsValid = true;
            return importModel;
        }

        private static Encoding GetEncoding(MultipartSection section)
        {
            MediaTypeHeaderValue mediaType;
            var hasMediaTypeHeader = MediaTypeHeaderValue.TryParse(section.ContentType, out mediaType);
            // UTF-7 is insecure and should not be honored. UTF-8 will succeed in 
            // most cases.
            if (!hasMediaTypeHeader || Encoding.UTF7.Equals(mediaType.Encoding))
            {
                return Encoding.UTF8;
            }
            return mediaType.Encoding;
        }

    }
}