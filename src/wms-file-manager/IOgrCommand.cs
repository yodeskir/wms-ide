using System;
using System.Collections.Generic;
using System.Text;

namespace fileManager
{
    public interface IOgrCommand
    {
        Tuple<bool, string> Execute(string filename, string layername, string username, string pgcnn);
        string GetGeometryInfo(string filename, string layername);
        bool IsCompleted { get; set; }
    }
}
