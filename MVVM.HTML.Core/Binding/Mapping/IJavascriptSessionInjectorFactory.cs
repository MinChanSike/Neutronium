﻿using MVVM.HTML.Core.Binding.Mapping;
using MVVM.HTML.Core.HTMLBinding;
using MVVM.HTML.Core.JavascriptEngine.JavascriptObject;

namespace MVVM.HTML.Core.Binding
{
    public interface IJavascriptSessionInjectorFactory
    {
        IJavascriptSessionInjector CreateInjector(IWebView iWebView, IJavascriptChangesListener iJavascriptListener);
    }
}
