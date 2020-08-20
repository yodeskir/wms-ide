using mapfileManager.Interfaces;
using Microsoft.Extensions.Options;
using wmsShared.Model;

namespace mapfileManager
{
    public class MapServerOptions : IMapServerOptions
    {
        private readonly IOptions<MapServerRuntimeOptions> _runtimeOptions;
        private readonly IOptions<MapEntriesRuntimeOptions> _entriesOptions;
        private readonly IOptions<MapDirectivesRuntimeOptions> _directivesOptions;

        public MapServerOptions(IOptions<MapServerRuntimeOptions> runtimeOptions, IOptions<MapEntriesRuntimeOptions> entriesOptions, IOptions<MapDirectivesRuntimeOptions> directivesOptions)
        {
            _runtimeOptions = runtimeOptions;
            _entriesOptions = entriesOptions;
            _directivesOptions = directivesOptions;
        }

        public MapServerRuntimeOptions GetRuntimeOptions()
        {
            return _runtimeOptions.Value;
        }

        public MapEntriesRuntimeOptions GetEntryOptions() {
            return _entriesOptions.Value;
        }

        public MapDirectivesRuntimeOptions GetDirectivesOptions() {
            return _directivesOptions.Value;
        }
    }
}
