let parseUrl = url => {

    let isPointOnUrl = url => /\./.test(url);                                               // 判断 url 存不存在 “.”
    let isSlashOnsuffixs = suffixs => /\//.test(suffixs);                                   // 判断 suffixs(域名后缀) 存不存在 “/”
    let getUrlSlashCount = url => url.split(/\//).length - 1;                               // 获取 url 中  “/” 出现的次数
    let isQuestionOrSharpOnsuffixs = suffixs => /[\?#]/.test(suffixs);                      // 判断 suffixs(域名后缀) 存不存在 “?” 或 “#”
    let isQuestionAndSharpOnsuffixs = suffixs => /\?/.test(suffixs) && /#/.test(suffixs);   // 判断 suffixs(域名后缀) 是否同时存在 “?” 或 “#”
    let onlyQuestionOnsuffixs = suffixs => /\?/.test(suffixs);                              // 判断 suffixs(域名后缀) 是否只存在 “?”
    let onlySharpOnsuffixs = suffixs => /#/.test(suffixs);                                  // 判断 suffixs(域名后缀) 是否只存在 “#”
    let getSlashIndex = suffixs => suffixs.indexOf('/');                                    // 找到 suffixs(域名后缀) 中的第一个 “/” 的下标
    let newUrl = (url, lastPointIndex) => url.substring(0, lastPointIndex);                 // 根据 lastPointIndex 生成新的 url

    let getPointAndsuffixs = url =>({                                                       // 找 url 的最后一个 “.” 的下标和 url 的域名后缀 (suffixs)
            lastPointIndex: url.lastIndexOf('.'),                                           // 进来后找 url 的最后的一个 “.” 的下标
            suffixs: url.substring(url.lastIndexOf('.'))                                    // 找 url 这个域名的后缀 (suffixs)
    });

    let parseSuffixs = (suffixs) => ({                                                      // 获取 url 这个域名真正的后缀 (suffix)
        suffix: suffixs.substring(0, getSlashIndex(suffixs)),
        afterSuffixs: suffixs.substring(getSlashIndex(suffixs))
    });

    let parsePrepSuffixs = (url, lastPointIndex) => ({                                      // 解析 Suffixs 前面的字符串 'http://www.xiyanghui.'
        protocol: `${url.substring(0, lastPointIndex).split(/:\/\//)[0]}`,
        prephost: url.substring(0, lastPointIndex).split(/:\/\//)[1]
    });

    let getProtocol = (url, lastPointIndex) => (                                            // 获取 protocol
        parsePrepSuffixs(url, lastPointIndex).protocol
    );

    let getHost = (url, lastPointIndex, suffixs) => (                                       // 获取 host
        parsePrepSuffixs(url, lastPointIndex).prephost + parseSuffixs(suffixs).suffix
    );

    let getPath = (suffixs) => {                                                            // 获取 path
        let {afterSuffixs} = parseSuffixs(suffixs);
        if (/#/.test(afterSuffixs)) {
            if (/\?/.test(afterSuffixs)) {
                return afterSuffixs.split(/#/)[0].split(/\?/)[0]
            } else {
                return afterSuffixs.split(/#/)[0]
            }
        } else {
            return afterSuffixs.split(/\?/)[0]
        }
    }

    let getQuery = (suffixs) => {                                                           // 获取 query
        let query = {};
        let queryStr = /#/.test(parseSuffixs(suffixs).afterSuffixs)
                       ?parseSuffixs(suffixs).afterSuffixs.split(/#/)[0].split(/\?/)[1]
                       :parseSuffixs(suffixs).afterSuffixs.split(/\?/)[1];
        queryStr.split(/&/).forEach((item, index) => {
            let tempArr = item.split('=');
            query[tempArr[0]] = tempArr[1];
        });
        return query;
    }

    let getHash = (suffixs) => parseSuffixs(suffixs).afterSuffixs.split(/#/)[1];            // 获取 hash

    let breakDown = (url, lastPointIndex, suffixs) => {
        if (isQuestionOrSharpOnsuffixs(suffixs)) {                                          // suffixs(域名后缀) 存在 “?” 或 “#”`
            // 'http://www.xiyanghui.com/product/list?id=123456&sort=discount#title'
            
            if (isQuestionAndSharpOnsuffixs(suffixs)) {                                     // suffixs(域名后缀) 同时存在 “?” 或 “#”
                // 'http://www.xiyanghui.com/product/list?id=123456&sort=discount#title'
                return {
                    protocol: getProtocol(url, lastPointIndex),
                    host: getHost(url, lastPointIndex, suffixs),
                    path: getPath(suffixs),
                    query: getQuery(suffixs),
                    hash: getHash(suffixs)
                }
            } else if (onlyQuestionOnsuffixs(suffixs)) {                                    // suffixs(域名后缀) 只存在 “?”
                // 'http://www.xiyanghui.com/product/list?id=123456&sort=discount'
                return {
                    protocol: getProtocol(url, lastPointIndex),
                    host: getHost(url, lastPointIndex, suffixs),
                    path: getPath(suffixs),
                    query: getQuery(suffixs),
                    hash: ''
                }
            } else if (onlySharpOnsuffixs(suffixs)) {                                       // suffixs(域名后缀) 只存在 “#”`
                // 'http://www.xiyanghui.com/product/list#title'
                return {
                    protocol: getProtocol(url, lastPointIndex),
                    host: getHost(url, lastPointIndex, suffixs),
                    path: getPath(suffixs),
                    query: '',
                    hash: getHash(suffixs)
                }
            }
        } else {                                                                            // suffixs(域名后缀) 不存在 “?” 或 “#”
            // 'http://www.xiyanghui.com/product/list'
            return {
                protocol: getProtocol(url, lastPointIndex),
                host: getHost(url, lastPointIndex, suffixs),
                path: parseSuffixs(suffixs).afterSuffixs,
                query: '',
                hash: ''
            }
        }
    }

    /* ================================================================ 入口 ================================================================ */
    if (isPointOnUrl(url)) {                                                                // 有 “.” 就进来了！
        let {lastPointIndex, suffixs} = getPointAndsuffixs(url);
        if (isSlashOnsuffixs(suffixs)) {                                                    // suffixs 中包含了斜杠
            // 'http://www.xiyanghui.com/product/list?id=123456&sort=discount#title'
            return breakDown(url, lastPointIndex, suffixs);
        } else {                                                                            // suffixs 中不包含斜杠
            if (getUrlSlashCount(url) > 2) {                                                // url 中  “/” 出现的次数大于 2
                // 'http://www.xiyanghui.com/product/list?id=123456&sort=discount#title.html'
                url = newUrl(url, lastPointIndex);                                          // 'http://www.xiyanghui.com/product/list?id=123456&sort=discount#title'
                lastPointIndex = getPointAndsuffixs(url).lastPointIndex;
                suffixs = getPointAndsuffixs(url).suffixs;
                return breakDown(url, lastPointIndex, suffixs);
            } else {                                                                        // url 中  “/” 出现的次数小于等于 2
                // 'http://www.xiyanghui.com'
                return {
                    protocol: url.split(/\//)[0].replace(/:/,''),
                    host: url.split(/\//)[2],
                    path: '',
                    query: '',
                    hash: ''
                }
            }
        }
    } else {
        let protocol = host = path = query = hash = '';
        return {protocol, host, path, query, hash};
    }
}

let URL = 'http://www.xiyanghui.com/product/list?id=123456&sort=discount#title';
let GET = parseUrl(URL);
console.log(`GET：${JSON.stringify(GET)}`);