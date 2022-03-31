import JavaScriptCore

let str = CommandLine.arguments[1]
let cwd = FileManager.default.currentDirectoryPath
let pathList = cwd.split(separator: "/");
let filePath = "/" + pathList[...(pathList.count - 9)].joined(separator: "/") + "/build/dist/mdfunction.bundle.js"
do {
    let contents = try String(contentsOfFile: filePath)
    let context: JSContext = JSContext()
    context.evaluateScript(contents)
    let result1: JSValue = context.evaluateScript("executeMdFunction('" + String(str) + "')")
    print("result:", result1)
} catch {}
