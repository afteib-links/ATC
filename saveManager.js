/*
  SaveManager
  - JSON export/import utilities for save data
  - Optional module: app.js checks for window.SaveManager before using
*/
(function(){
  function downloadJson(data, filename){
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'arithmetic_tower_save.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function readJsonFile(file){
    return new Promise((resolve, reject)=>{
      const reader = new FileReader();
      reader.onload = ()=>{
        try {
          const data = JSON.parse(reader.result);
          resolve(data);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  window.SaveManager = {
    downloadJson,
    readJsonFile
  };
})();
