using wmsShared.Model;

namespace mapfileManager.Interfaces
{
    public interface IMapServerOptions
    {
        MapDirectivesRuntimeOptions GetDirectivesOptions();
        MapEntriesRuntimeOptions GetEntryOptions();
        MapServerRuntimeOptions GetRuntimeOptions();
    }
}