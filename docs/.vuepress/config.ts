import { defineUserConfig } from 'vuepress'
import { viteBundler } from '@vuepress/bundler-vite'
import { defaultTheme } from '@vuepress/theme-default'

export default defineUserConfig({
    base: '/clr-via-csharp/',
    lang: 'zh-CN',
    title: 'CLR via C#',
    description: 'CLR via C# 第四版',
    head: [
        ['link', { rel: 'icon', href: '/assets/img/favicon.ico' }]
    ],

    bundler: viteBundler({
        // viteOptions: {},
        // vuePluginOptions: {},
    }),

    theme: defaultTheme({
        logo: '/assets/images/cover.jpg',

        repo: 'arytry/clr-via-csharp',
        editLink: true,    // 展示 repo 的编辑路径
        editLinkText: '在 GitHub 上编辑此页',
        lastUpdated: true,
        lastUpdatedText: '上次更新',

        contributors: false,
        // contributorsText: '贡献者',

        // navbar: bar.navbar(),
        // sidebar: bar.sidebar(),
        sidebar: [
            '/chapters/introduction.md',
            '/chapters/foreword.md',
            '/chapters/ch1_TheCLRSExecutionMode.md',
            '/chapters/ch2_Building.md',
            '/chapters/ch3_SharedAssemblies.md',
            '/chapters/ch4_TypeFundamentals.md',
            '/chapters/ch5_PrimitiveRefValType.md',
            '/chapters/ch6_TypeAndMemberBasics.md',
            '/chapters/ch7_ConstantsAndFields.md',
            '/chapters/ch8_Methods.md',
            '/chapters/ch9_Parameters.md',
            '/chapters/ch10_Properties.md',
            '/chapters/ch11_Events.md',
            '/chapters/ch12_Generics.md',
            '/chapters/ch13_Interfaces.md',
            '/chapters/ch14_CharStringText.md',
            '/chapters/ch15_EnumeratedTypes.md',
            '/chapters/ch16_Arrays.md',
            '/chapters/ch17_Delegates.md',
            '/chapters/ch18_CustomAttributes.md',
            '/chapters/ch19_NullableValueTypes.md',
            '/chapters/ch20_ExceptionsAndStateManae.md',
            '/chapters/ch21_ManagedHeapGarbage.md',
            '/chapters/ch22_CLRHostingAndAppDomain.md',
            '/chapters/ch23_AssemblyLoaingReflection.md',
            '/chapters/ch24_RuntimeSerialization.md',
            '/chapters/ch25_WinRTComponents.md',
            '/chapters/ch26_ThreadBasics.md',
            '/chapters/ch27_ComputeBoundAsync.md',
            '/chapters/ch28_IOBoundAsyncOperations.md',
            '/chapters/ch29_PrimitiveThreadSyncConstructs.md',
            '/chapters/ch30_hybridThreadSyncConst.md',
            '/chapters/Postscript.md',
        ]
        // sidebarDepth: 4,
    }),
})
