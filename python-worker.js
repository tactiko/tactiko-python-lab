importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js');
const ready = loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/'});
onmessage = async ({data}) => {
 try {
  const py = await ready;
  const lines=[];
  py.setStdout({batched:s=>lines.push(s)});
  py.setStderr({batched:s=>lines.push(s)});
  const globals=py.runPython('dict()');
  try {await py.runPythonAsync(data.code,{globals});postMessage({output:lines.join('\n')});}
  finally {globals.destroy();}
 } catch(e) {postMessage({error:String(e.message||e)});}
};
