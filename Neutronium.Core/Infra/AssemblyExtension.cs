﻿using System;
using System.Reflection;

namespace Neutronium.Core.Infra
{
    public static class AssemblyExtension
    {
        public static string GetPath(this Assembly @this)
        {
            var lCodeBase = @this.CodeBase;
            var lUri = new UriBuilder(lCodeBase);
            var lPath = Uri.UnescapeDataString(lUri.Path);
            return System.IO.Path.GetDirectoryName(lPath);
        }
    }
}
