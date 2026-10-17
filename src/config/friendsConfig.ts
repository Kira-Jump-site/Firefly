import type { FriendLink, FriendsPageConfig } from "../types/friendsConfig";

// 可以在src/content/spec/friends.md中编写友链页面下方的自定义内容

// 友链页面配置
export const friendsPageConfig: FriendsPageConfig = {
	// 页面标题，如果留空则使用 i18n 中的翻译
	title: "",

	// 页面描述文本，如果留空则使用 i18n 中的翻译
	description: "",

	// 是否显示底部自定义内容（friends.mdx 中的内容）
	showCustomContent: true,

	// 是否显示评论区，需要先在commentConfig.ts启用评论系统
	showComment: true,

	// 是否开启随机排序配置，如果开启，就会忽略权重，构建时进行一次随机排序
	randomizeSort: false,
};

// 友链配置
export const friendsConfig: FriendLink[] = [
	{title:"星宇安全实验室",siteurl:"https://bk.zhaozhiqiang.pw/",imgurl:"",desc:"",tags:["Blog"],weight:30,enabled:true},
	{title:"Lin Blog",siteurl:"https://linlog.top",imgurl:"",desc:"",tags:["Blog"],weight:29,enabled:true},
	{title:"星空驿站 Starlight Station",siteurl:"https://baiyangmu.xyz",imgurl:"",desc:"",tags:["Blog"],weight:28,enabled:true},
	{title:"星诺的博客",siteurl:"https://blog.astrvow.com/",imgurl:"",desc:"",tags:["Blog"],weight:27,enabled:true},
	{title:"Aimerting",siteurl:"https://blog.xuioo.com/",imgurl:"",desc:"",tags:["Blog"],weight:26,enabled:true},
	{title:"SengokuCola’sBlog",siteurl:"https://home.nibutupaopao.top",imgurl:"",desc:"",tags:["Blog"],weight:25,enabled:true},
	{title:"Eric-Termina的博客",siteurl:"https://blog.ericterminal.com",imgurl:"",desc:"",tags:["Blog"],weight:24,enabled:true},
	{title:"MmzMing的知识库",siteurl:"https://tblog.mmzhiku.xyz",imgurl:"",desc:"",tags:["Blog"],weight:23,enabled:true},
	{title:"Elykia",siteurl:"https://blog.elykia.cn",imgurl:"",desc:"",tags:["Blog"],weight:22,enabled:true},
	{title:"十三",siteurl:"https://blog.nw177.cn",imgurl:"",desc:"",tags:["Blog"],weight:21,enabled:true},
	{title:"versus0",siteurl:"https://blog.542000.xyz",imgurl:"",desc:"",tags:["Blog"],weight:20,enabled:true},
	{title:"年华",siteurl:"https://blog.520781.xyz",imgurl:"",desc:"",tags:["Blog"],weight:19,enabled:true},
	{title:"L!!!!ght",siteurl:"https://sunlight.kejk.cn",imgurl:"",desc:"",tags:["Blog"],weight:18,enabled:true},
	{title:"Hyde Blog",siteurl:"https://seasir.top",imgurl:"",desc:"",tags:["Blog"],weight:17,enabled:true},
	{title:"番茄主理人",siteurl:"https://fqzlr.com",imgurl:"",desc:"",tags:["Blog"],weight:16,enabled:true},
	{title:"若木秋光の Blog Ver.3.0",siteurl:"https://blog.rmqg.org/",imgurl:"",desc:"",tags:["Blog"],weight:15,enabled:true},
	{
		title: "夏夜流萤",
		imgurl:
			"https://weavatar.com/avatar/d252655d40d6874417a720bad0a6c5f77f8f6a1fd2f882f8f338402dc37e4190?s=640",
		desc: "飞萤之火自无梦的长夜亮起，绽放在终竟的明天。",
		siteurl: "https://blog.cuteleaf.cn",
		tags: ["Blog"],
		weight: 10, // 权重，数字越大排序越靠前
		enabled: true, // 是否启用
	},
	{
		title: "Firefly Docs",
		imgurl: "https://docs-firefly.cuteleaf.cn/logo.png",
		desc: "Firefly主题模板文档",
		siteurl: "https://docs-firefly.cuteleaf.cn",
		tags: ["Docs"],
		weight: 9,
		enabled: true,
	},
	{
		title: "Astro",
		imgurl: "https://avatars.githubusercontent.com/u/44914786?v=4&s=640",
		desc: "The web framework for content-driven websites. ⭐️ Star to support our work!",
		siteurl: "https://github.com/withastro/astro",
		tags: ["Framework"],
		weight: 8,
		enabled: true,
	},
];

// 获取启用的友链并进行排序
export const getEnabledFriends = (): FriendLink[] => {
	const friends = friendsConfig.filter((friend) => friend.enabled);

	if (friendsPageConfig.randomizeSort) {
		return friends.sort(() => Math.random() - 0.5);
	}

	return friends.sort((a, b) => b.weight - a.weight);
};
