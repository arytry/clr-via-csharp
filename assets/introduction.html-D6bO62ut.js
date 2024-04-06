import{_ as r,r as a,o as s,c as i,a as e,d as t,b as n,e as l}from"./app-IxoMmWNN.js";const c={},h=e("h1",{id:"前言",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#前言"},[e("span",null,"前言")])],-1),d=e("p",null,"1999年10月，Microsoft的一些人首次向我展示了Microsoft .NET Framework、公共语言运行时(CLR)和C#编程语言。看到这一切时，我惊呆了，我知道我写软件的方式要发生非常大的变化了。他们请我为团队做一些顾问工作，我当即同意了。刚开始，我以为.NET Framework 是 Win32 API 和 COM 上的一个抽象层。但随着我投入越来越多的时间研究，我意思到它是一个更宏伟的项目。某种程度上，它是自己的操作系统。有自己的内存管理器，自己的安全系统，自己的文件加载器，自己的错误处理机制，自己的应用程序隔离边界(AppDomain)、自己的线程处理模型等。本书解释了所有这些主题，帮你为这个平台高效地设计和实现应用程序和组件。",-1),p={href:"http://Wintellect.com",target:"_blank",rel:"noopener noreferrer"},_=e("h2",{id:"本书面向的读者",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#本书面向的读者"},[e("span",null,"本书面向的读者")])],-1),m=e("p",null,"本书旨在解释如何为.NET Framework开发应用程序和可重用的类。具体地说，我要解释CLR的工作原理及其提供的功能，还要讨论Framework Class Libarary(FCL)的各个部分。没有一本书能完整地解释FCL——其中含有数以千计的类型，而且这个数字正在以惊人速度增长。所以，我准备将重点放在每个开发人员都需要注意的核心类型上面。另外，虽然不会专门讲Windows窗体、Windows Presentation Foundation(WPF)、Microsoft Silverlight、XML Web服务、Web窗体、Microsoft ASP.NET MVC、Windows Store应用等，但本书描述的技术适用于所有这些应用程序类型。",-1),u=e("p",null,"本书围绕Microsoft Visual Studio 2012/2013，.NET Framework 4.5.x 和 C# 5.0 展开。由于Microsoft在发布这些技术的新版本时，会试图保持很大程度的向后兼容性，所以本书描述的许多内容也适合之前的版本。所有示例代码都用C#编程语言写成。但由于CLR可由许多编程语言使用，所以本书内容也适合非C#程序员。",-1),f={class:"custom-container tip"},b=e("p",{class:"custom-container-title"},"注意",-1),k={href:"https://training.atmosera.com/wp-content/uploads/2017/09/CLR-via-C-4th-Edition-Code.zip",target:"_blank",rel:"noopener noreferrer"},C=l('<p>我和我的编辑进行了艰苦卓绝的工作，试图为你提供最准确、最新、最深入、最容易阅读和理解、没有错误的信息。但是，即便有如此完美的团队协作，疏漏和错误也在所难免。如果你发现了本书的任何错误或者想提出一些建设性的意见，请发送邮件到<a href="mailto:JeffreyR@Wintellect.com">JeffreyR@Wintellect.com</a></p><h2 id="致谢" tabindex="-1"><a class="header-anchor" href="#致谢"><span>致谢</span></a></h2><p>没有别人的帮助和技术援助，我是不可能写好这本书的。尤其要感谢我的家人。写好一本书所投入的时间和精力无法衡量。我只知道，没有我的妻子Kristin和两个儿子Aidan和Grant的支持，根本不可能有这本书的面世。多少次想花些时间一家人小聚，都因为本书而放弃。现在，本书总算告一段落，终于有时间做自己喜欢做的事情了。</p><p>本书的修订得到了一些“高人”的协助。.NET Framework团体队的一些人(其中许多都是我的朋友)审阅了其中的章节，我和他们进行了许多发人深省的对话。Christophe Nasarre 参与了我几本书的出版，在审阅本书并确保我能以最恰当的方式来表达的过程中，表现出了非凡的才能。他对本书的品质有至关重要的影响。和往常一样，我和Microsoft Press的团体进行了令人愉快的合作。特别感谢Ben Ryan，Devon Musgrave和Carol Dillingham。另外，感谢Susie Carr和Candace Sinclair提供的编辑和制作支持。</p><h2 id="勘误和支持" tabindex="-1"><a class="header-anchor" href="#勘误和支持"><span>勘误和支持</span></a></h2>',5),g=e("br",null,null,-1),w={href:"http://www.oreilly.com/catalog/errata.csp?isbn=0790145353665",target:"_blank",rel:"noopener noreferrer"},N=e("br",null,null,-1),F={href:"http://go.microsoft.com/FWLink/?Linkid=266601",target:"_blank",rel:"noopener noreferrer"},L=e("br",null,null,-1),E=e("br",null,null,-1),v=e("a",{href:"mailto:mspinput@microsoft.com"},"mspinput@microsoft.com",-1),M=e("br",null,null,-1),W=e("br",null,null,-1),x=e("br",null,null,-1),T={href:"http://transbot.blog.163.com",target:"_blank",rel:"noopener noreferrer"};function R(S,P){const o=a("ExternalLinkIcon");return s(),i("div",null,[h,d,e("p",null,[t("我写这本书是2012年10月，距离首次接触.NET Framework 和 C#正好13年。13年来，我以Microsoft顾问身份开发过各式各样的应用程序，为.NET Framework本身也贡献良多。作为我自己公司"),e("a",p,[t("Wintellect"),n(o)]),t("的合伙人，我还要为大量客户工作，帮他们设计、调试、优化软件以及解决使用.NET Framework进行高效率编程。贯穿本书所有主题，你都会看到我的经验之谈。")]),_,m,u,e("div",f,[b,e("p",null,[t("本书代码下载地址:"),e("em",null,[e("a",k,[t("https://training.atmosera.com/wp-content/uploads/2017/09/CLR-via-C-4th-Edition-Code.zip"),n(o)])])])]),C,e("p",null,[t("我们尽最大努力保证本书的准确性。勘误或更改会添加到以下网页:"),g,e("a",w,[t("http://www.oreilly.com/catalog/errata.csp?isbn=0790145353665"),n(o)]),N,e("a",F,[t("http://go.microsoft.com/FWLink/?Linkid=266601"),n(o)]),t(" 如果发现未列出的错误，可通过相同的网页报告。"),L,t(" 如需其他支持，请致函Microsoft Press Book Support部门:"),E,v,M,t(" 注意，上述邮件地址不提供产品支持。"),W,t(" 最后，本书中文版的支持（勘误和资源下载）请访问译者博客："),x,e("a",T,[t("http://transbot.blog.163.com"),n(o)])])])}const V=r(c,[["render",R],["__file","introduction.html.vue"]]),z=JSON.parse('{"path":"/zh/chapters/introduction.html","title":"前言","lang":"zh-CN","frontmatter":{},"headers":[{"level":2,"title":"本书面向的读者","slug":"本书面向的读者","link":"#本书面向的读者","children":[]},{"level":2,"title":"致谢","slug":"致谢","link":"#致谢","children":[]},{"level":2,"title":"勘误和支持","slug":"勘误和支持","link":"#勘误和支持","children":[]}],"git":{"updatedTime":1712403629000},"filePathRelative":"zh/chapters/introduction.md"}');export{V as comp,z as data};