export const findClass = (javaCode: string): string => {
    // remove all comments 
  javaCode = javaCode.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, "");
    // console.log(javaCode)
    let mainclass = ""
    let javaCodeArray = javaCode.split("class")
    for (const code of javaCodeArray) {
        const cd = code.trim()
        if(cd.includes("public") && cd.includes("static") && cd.includes("main")){
            mainclass = cd.split(" ")[0] as string
        }
    }

    console.log(mainclass)
    return mainclass || "Main"
}
