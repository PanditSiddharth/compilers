export const findClass = (javaCode: string): string => {
  // remove all comments
  javaCode = javaCode.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, "");

  let mainclass = "";
  let javaCodeArray = javaCode.split("class");

  for (const code of javaCodeArray) {
    const cd = code.trim();
    if (cd.includes("public") && cd.includes("static")) {
      // class name nikalna
      mainclass = cd.split("{")?.[0]?.split(" ")[0]?.trim() || "Main";
      break;
    }
  }

  console.log(mainclass);
  return mainclass || "Main";
};

