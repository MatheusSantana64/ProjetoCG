
function initShaders(gl, vertexShaderSource, fragShaderSource) {
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, loadFileAJAX(vertexShaderSource));
    gl.compileShader(vertexShader);

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, loadFileAJAX(fragShaderSource));
    gl.compileShader(fragmentShader);
    
    console.log(gl.getShaderInfoLog(vertexShader), gl.getShaderInfoLog(fragmentShader));

    //Cria o programa e anexa os shaders ao programa
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    gl.useProgram(program);
    gl.enable(gl.DEPTH_TEST);

    return program;
}