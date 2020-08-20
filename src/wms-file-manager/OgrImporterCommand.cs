using System;
using System.Text.RegularExpressions;
using ToolBox.Bridge;
using ToolBox.Notification;
using ToolBox.Platform;
using wmsTools;

namespace fileManager
{
    public class OgrImporterCommand: IOgrCommand
    {
        private string ogrPath;
        public static INotificationSystem _notificationSystem { get; set; }
        public static IBridgeSystem _bridgeSystem { get; set; }
        public static ShellConfigurator _shell { get; set; }

        public bool IsCompleted { get; set; }

        public OgrImporterCommand(string ogrpath) {
            ogrPath = ogrpath;
        }
        public Tuple<bool, string> Execute(string filename, string layername, string username, string pgcnn)
        {
            
            string args = $"{ogrPath}ogr2ogr -f \"PostgreSQL\" PG:\"{pgcnn}\" -nln {layername} \"{filename}\" -overwrite -skipfailure -t_srs EPSG:4326 -nlt PROMOTE_TO_MULTI -lco GEOMETRY_NAME=geom -lco LAUNDER=yes -lco FID=id -lco schema={username} -lco OVERWRITE=YES";
            ConsoleHelper.Info($"Calling ogr2ogr with: {args}");

            _notificationSystem = NotificationSystem.Default;
            switch (OS.GetCurrent())
            {
                case "win":
                    _bridgeSystem = BridgeSystem.Bat;
                    break;
                case "mac":
                case "gnu":
                    _bridgeSystem = BridgeSystem.Bash;
                    break;
            }
            _shell = new ShellConfigurator(_bridgeSystem, _notificationSystem);

            var res = _shell.Term(args); //, pgcnn, layername, filename, username

            ConsoleHelper.Warning($"Result: {res.stdout} || Error: {res.stderr}");

            if (res.stderr.Length > 5 && res.stderr.Contains("error", StringComparison.InvariantCultureIgnoreCase))
                return new Tuple<bool, string>(false, res.stderr);
            else
                return new Tuple<bool, string>(true, res.stdout);
            
        }

        public string GetGeometryInfo(string filename, string layername)
        {
            string args = "ogrinfo -so \"{0}\" -sql \"SELECT 1 FROM {1}\"";
                        
            _notificationSystem = NotificationSystem.Default;
            switch (OS.GetCurrent())
            {
                case "win":
                    _bridgeSystem = BridgeSystem.Bat;
                    break;
                case "mac":
                case "gnu":
                    _bridgeSystem = BridgeSystem.Bash;
                    break;
            }
            _shell = new ShellConfigurator(_bridgeSystem, _notificationSystem);

            var res = _shell.Term(string.Format(args, filename, layername));
            if (res.stderr.Length > 10)
                return string.Empty;
            else
            {
                var meta = res.stdout;
                Regex pattern = new Regex(@"(?<=Geometry:)\W(\w+)", RegexOptions.IgnoreCase);
                Match match = pattern.Match(meta);
                return match.Groups[0].Value.Trim();
            }
        }
    }
}
