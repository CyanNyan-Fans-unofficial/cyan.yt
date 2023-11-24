# Cyan's short URL

[Cloudflare Workers](https://developers.cloudflare.com/workers/)

### 配置说明

```js
let config = {  // 配置字典
    mappings: {  // 重定向映射
        "cyannyan.com": {  // 域名
            "/mc": "https://github.com/CyanNyan/CyanMC",  // 重定向后缀
            "/mc/": "https://github.com/CyanNyan/CyanMC",  // 允许在后缀之后加任意长度的内容
        }
    },

    // default redirect
    proto: "https",  // 默认协议
    status: 302,  // 默认状态码
    strips: ["www"],  // 读取配置时忽略域名前缀

    // If non match, redirect to this host
    fallback: null
}
```
