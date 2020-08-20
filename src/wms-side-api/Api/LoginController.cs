using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using wms_ide.Models;

namespace wms_ide.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        private readonly IMemoryCache _cache;

        public LoginController(IMemoryCache cache)
        {
            _cache = cache;
        }

        [HttpPost]
        [Route("signin")]
        public async Task<IActionResult> Login([FromBody] Credentials credentials)
        {
            var result = new AuthResult();
            if (!ValidateInputs(credentials))
                return new JsonResult(new AuthResult()
                    {statusCode = 401, statusMessage = "You must provide user name and password.", token = null});
            
            const string url = "http://localhost:5050/authenticate";
            var uri = new Uri(url);
            var handler = new HttpClientHandler();
            var cookies = new CookieContainer();
            handler.CookieContainer = cookies;

            var client = new HttpClient(handler);
            var byteArray = Encoding.ASCII.GetBytes(credentials.username + ":" + credentials.password);
            client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", Convert.ToBase64String(byteArray));

            var response = await client.GetAsync(url);
            var status = (int)response.StatusCode;

            result.statusCode = status;
            result.statusMessage = response.ReasonPhrase;

            var responseCookies = cookies.GetCookies(uri).Cast<Cookie>();

            foreach (var cookie in responseCookies)
            {
                if (!cookie.Name.Equals("WMS.Auth")) 
                    continue;
                result.token = cookie.Value;
                break;
            }

            if (string.IsNullOrEmpty(result.token))
            {
                var tck = response.Headers.FirstOrDefault(h => h.Key.Equals("Set-Cookie")).Value?.FirstOrDefault();
                if (string.IsNullOrEmpty(tck))
                {
                    result.statusCode = 401;
                    result.statusMessage = "Can not authenticate. Please, check user name and password and try again.";
                }
                result.token = tck?.Split("=")[1];
            }
            return new JsonResult(result);

        }

        private static bool ValidateInputs(Credentials credentials)
        {
            return (credentials.username != null && credentials.password != null);
        }
    }
}