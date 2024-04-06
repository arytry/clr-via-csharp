import { defineUserConfig } from 'vuepress'
import { viteBundler } from '@vuepress/bundler-vite'
import { defaultTheme } from '@vuepress/theme-default'

export default defineUserConfig({
    base: '/clr-via-csharp/',
    title: 'CLR via C#',
    head: [
        ['link', { rel: 'icon', href: '/assets/img/favicon.ico' }]
    ],
    locales: {
        '/': {
            lang: 'zh-CN',
            description: 'CLR via C# 第四版'
        },
        // '/': {
        //     lang: 'en-US',
        //     description: 'CLR via C# 4th Edition',
        // },
        // '/zh/': {
        //     lang: 'zh-CN',
        //     description: 'CLR via C# 第四版',
        // },
        '/ru/': {
            lang: 'ru-RU',
            description: 'CLR via C# Четвертое издание',
        }
    },

    bundler: viteBundler({
        // viteOptions: {},
        // vuePluginOptions: {},
    }),

    theme: defaultTheme({
        logo: '/assets/images/cover.jpg',

        repo: 'arytry/clr-via-csharp',
        docsDir: 'docs',
        editLink: true,    // 展示 repo 的编辑路径
        lastUpdated: true,

        contributors: false,
        // contributorsText: '贡献者',

        locales: {
            '/': {
                selectLanguageName: '简体中文',
                selectLanguageText: '选择语言',

                editLinkText: '在 GitHub 上编辑此页',
                lastUpdatedText: '上次更新',

                sidebar: [
                    '/chapters/introduction.md',
                    '/chapters/foreword.md',
                    '/chapters/ch01_TheCLRSExecutionMode.md',
                    '/chapters/ch02_Building.md',
                    '/chapters/ch03_SharedAssemblies.md',
                    '/chapters/ch04_TypeFundamentals.md',
                    '/chapters/ch05_PrimitiveRefValType.md',
                    '/chapters/ch06_TypeAndMemberBasics.md',
                    '/chapters/ch07_ConstantsAndFields.md',
                    '/chapters/ch08_Methods.md',
                    '/chapters/ch09_Parameters.md',
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
            },
            '/zh/': {
                selectLanguageName: '简体中文',
                selectLanguageText: '选择语言',

                editLinkText: '在 GitHub 上编辑此页',
                lastUpdatedText: '上次更新',

                sidebar: [
                    '/zh/chapters/introduction.md',
                    '/zh/chapters/foreword.md',
                    '/zh/chapters/ch01_TheCLRSExecutionMode.md',
                    '/zh/chapters/ch02_Building.md',
                    '/zh/chapters/ch03_SharedAssemblies.md',
                    '/zh/chapters/ch04_TypeFundamentals.md',
                    '/zh/chapters/ch05_PrimitiveRefValType.md',
                    '/zh/chapters/ch06_TypeAndMemberBasics.md',
                    '/zh/chapters/ch07_ConstantsAndFields.md',
                    '/zh/chapters/ch08_Methods.md',
                    '/zh/chapters/ch09_Parameters.md',
                    '/zh/chapters/ch10_Properties.md',
                    '/zh/chapters/ch11_Events.md',
                    '/zh/chapters/ch12_Generics.md',
                    '/zh/chapters/ch13_Interfaces.md',
                    '/zh/chapters/ch14_CharStringText.md',
                    '/zh/chapters/ch15_EnumeratedTypes.md',
                    '/zh/chapters/ch16_Arrays.md',
                    '/zh/chapters/ch17_Delegates.md',
                    '/zh/chapters/ch18_CustomAttributes.md',
                    '/zh/chapters/ch19_NullableValueTypes.md',
                    '/zh/chapters/ch20_ExceptionsAndStateManae.md',
                    '/zh/chapters/ch21_ManagedHeapGarbage.md',
                    '/zh/chapters/ch22_CLRHostingAndAppDomain.md',
                    '/zh/chapters/ch23_AssemblyLoaingReflection.md',
                    '/zh/chapters/ch24_RuntimeSerialization.md',
                    '/zh/chapters/ch25_WinRTComponents.md',
                    '/zh/chapters/ch26_ThreadBasics.md',
                    '/zh/chapters/ch27_ComputeBoundAsync.md',
                    '/zh/chapters/ch28_IOBoundAsyncOperations.md',
                    '/zh/chapters/ch29_PrimitiveThreadSyncConstructs.md',
                    '/zh/chapters/ch30_hybridThreadSyncConst.md',
                    '/zh/chapters/Postscript.md',
                ]
            },
            '/ru/': {
                selectLanguageName: 'Русский',
                selectLanguageText: 'Выберите язык',

                sidebar: [
                    '/ru/chapters/ch01_TheCLRSExecutionMode.md',
                    '/ru/chapters/ch02_Building.md',
                    '/ru/chapters/ch03_SharedAssemblies.md',
                    '/ru/chapters/ch04_TypeFundamentals.md',
                    '/ru/chapters/ch05_PrimitiveRefValType.md',
                    '/ru/chapters/ch06_TypeAndMemberBasics.md',
                    '/ru/chapters/ch07_ConstantsAndFields.md',
                    '/ru/chapters/ch08_Methods.md',
                    '/ru/chapters/ch09_Parameters.md',
                    '/ru/chapters/ch10_Properties.md',
                    '/ru/chapters/ch11_Events.md',
                    '/ru/chapters/ch12_Generics.md',
                    '/ru/chapters/ch13_Interfaces.md',
                    '/ru/chapters/ch14_CharStringText.md',
                    '/ru/chapters/ch15_EnumeratedTypes.md',
                    '/ru/chapters/ch16_Arrays.md',
                    '/ru/chapters/ch17_Delegates.md',
                    '/ru/chapters/ch18_CustomAttributes.md',
                    '/ru/chapters/ch19_NullableValueTypes.md',
                    '/ru/chapters/ch20_ExceptionsAndStateManae.md',
                    '/ru/chapters/ch21_ManagedHeapGarbage.md',
                    '/ru/chapters/ch22_CLRHostingAndAppDomain.md',
                    '/ru/chapters/ch23_AssemblyLoaingReflection.md',
                    '/ru/chapters/ch24_RuntimeSerialization.md',
                    '/ru/chapters/ch25_WinRTComponents.md',
                    '/ru/chapters/ch26_ThreadBasics.md',
                    '/ru/chapters/ch27_ComputeBoundAsync.md',
                    '/ru/chapters/ch28_IOBoundAsyncOperations.md',
                    '/ru/chapters/ch29_PrimitiveThreadSyncConstructs.md',
                    '/ru/chapters/ch30_hybridThreadSyncConst.md',
                ]
            }
        },
    }),
})
