const find = (javaCode: string): string => {
    let lines: string[] = javaCode.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').split(/\r?\n/);
    const findMainFunction = (lines: string[]): string | undefined => lines.find(line => line.includes('public static void main(String[]'));
    const mainIndex = lines.indexOf(findMainFunction(lines) ?? '');

    let mainClass: string | undefined = '';
    for (let i = mainIndex; i >= 0; i--) {
        if (lines[i]?.includes('class')) {
            const match = lines[i]?.match(/(class\s+)([A-Za-z0-9_]+)/);
            mainClass = match ? match[2] : '';
            break;
        }
    }

    return mainClass as string;
};

export default find;