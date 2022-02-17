import JavaScriptCore

let cwd = FileManager.default.currentDirectoryPath
let pathList = cwd.split(separator: "/");
let filePath = "/" + pathList[...(pathList.count - 9)].joined(separator: "/") + "/build/dist/mdfunction.bundle.js"
do {
    let contents = try String(contentsOfFile: filePath)
    let context: JSContext = JSContext()
    context.evaluateScript(contents)
    let result1: JSValue = context.evaluateScript("executeMdFunction('eyJjb250cm9sIjp7ImNvbnRyb2xJZCI6IjYxODlkZGJlMWMyODU0ZGQzNTM5MjQzNyIsInR5cGUiOjIsImFkdmFuY2VkU2V0dGluZyI6eyJkZWZzb3VyY2UiOiIiLCJkZWZhdWx0dHlwZSI6IjEiLCJkeW5hbWljc3JjIjoiIiwiZGVmYXVsdGZ1bmMiOiJ7XCJleHByZXNzaW9uXCI6XCJTVU0oJDYxODlkZGQ5MWMyODU0ZGQzNTM5MjQ0NSQsJDYxODlkZGQ5MWMyODU0ZGQzNTM5MjQ0NiQpXCIsXCJzdGF0dXNcIjoxfSIsIm1pbiI6IiIsIm1heCI6IiJ9fSwiZm9ybURhdGEiOlt7ImNvbnRyb2xJZCI6IjYxODlkZGQ5MWMyODU0ZGQzNTM5MjQ0NSIsInR5cGUiOjYsInZhbHVlIjoiMyJ9LHsiY29udHJvbElkIjoiNjE4OWRkZDkxYzI4NTRkZDM1MzkyNDQ2IiwidHlwZSI6NiwidmFsdWUiOiIzIn1dfQ==')")
    print("result:", result1)
} catch {}
