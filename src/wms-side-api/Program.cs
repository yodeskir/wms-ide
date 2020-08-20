using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using System;

namespace wms_ide
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var environmentName = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
            var configuration = new ConfigurationBuilder()
                .AddJsonFile("appsettings.json", false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{environmentName}.json", false, reloadOnChange: true)
                .Build();

            Console.WriteLine($"Using ASPNETCORE_ENVIRONMENT = {environmentName}");

            var urls = configuration.GetValue("UseUrls", "http://0.0.0.0");

            BuildWebHost(args, urls).Run();

        }

        public static IWebHost BuildWebHost(string[] args, string urls) =>
            
            WebHost.CreateDefaultBuilder(args)
                .ConfigureAppConfiguration((configurationBuilder)=>
                {
                    configurationBuilder.AddJsonFile("appsettings.wmsstyle.json", false, true);
                })
                .UseKestrel()
                .UseUrls(urls)
                .UseStartup<Startup>()
                .Build();

    }
}
