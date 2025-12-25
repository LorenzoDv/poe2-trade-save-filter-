// Debug mode: true when extension is loaded unpacked (developer mode)
const DEBUG = !('update_url' in chrome.runtime.getManifest());

function debugLog(...args) {
  if (DEBUG) {
    console.log('[POE2 Save Filter]', ...args);
  }
}

debugLog('Extension loaded (DEBUG MODE)');

function waitForElements(selector, callback, timeout = 10000) {
  debugLog('waitForElements: looking for', selector);
  const startTime = Date.now();
  const interval = setInterval(() => {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      debugLog('waitForElements: FOUND', selector, elements);
      clearInterval(interval);
      callback(elements);
    }
    if (Date.now() - startTime > timeout) {
      debugLog('waitForElements: TIMEOUT for', selector);
      clearInterval(interval);
    }
  }, 100);
}

waitForElements('.controls-center', (elements) => {
  debugLog('controls-center callback triggered');

  elements.forEach((targetDiv, index) => {
    debugLog('Processing targetDiv', index, targetDiv);
    if (!targetDiv.querySelector('#save-filter-btn')) {
      debugLog('No save-filter-btn found, setting up...');
      const btnSearch = document.querySelector('.search-btn');
      const btnClear = document.querySelector('.clear-btn');
      debugLog('btnSearch:', btnSearch, 'btnClear:', btnClear);
      const saveButton = document.createElement('button');

      btnSearch.addEventListener('click', function () {
        debugLog('Search button clicked!');
        
        saveButton.textContent = 'Save Filter';
        saveButton.id = 'save-filter-btn';
        saveButton.style.backgroundColor = '#357938';
        saveButton.style.color = 'white';
        saveButton.style.border = 'none';
        saveButton.style.cursor = 'pointer';
        saveButton.style.marginLeft = '10px';
        saveButton.style.fontSize = '13px'

        saveButton.addEventListener('mouseenter', function () {
          saveButton.style.backgroundColor = '#329b37';
        });

        saveButton.addEventListener('mouseleave', function () {
          saveButton.style.backgroundColor = '#357938';
        });
      });
      saveButton.addEventListener('click', function () {
        const urlPath = window.location.href;
      });

      btnClear.addEventListener('click', function () {
        saveButton.remove();
      });
    }
    const interval = setInterval(() => {
      const urlPath = window.location.href;
      const regex = /\/trade2\/search\/poe2\/[^\/]+\/(.+)/;
      debugLog('Interval check - URL:', urlPath, 'Regex match:', regex.test(urlPath));
      if (regex.test(urlPath)) {
        debugLog('URL matches! Checking for existing button...');
        if (!targetDiv.querySelector('#save-filter-btn')) {
          debugLog('Creating Save Filter button!');
          const btnClear = document.querySelector('.clear-btn');
          const saveButton = document.createElement('button');
  
          saveButton.textContent = 'Save Filter';
          saveButton.id = 'save-filter-btn';
          saveButton.style.backgroundColor = '#357938';
          saveButton.style.color = 'white';
          saveButton.style.border = 'none';
          saveButton.style.cursor = 'pointer';
          saveButton.style.marginLeft = '10px';
          saveButton.style.fontSize = '13px'

          saveButton.addEventListener('click', function () {
            const urlPathForSave = window.location.href;
            const urlId = Date.now();
        
            chrome.storage.sync.get(['savedUrls'], (data) => {
              const savedUrls = data.savedUrls || [];
              savedUrls.push({ id: urlId, url: urlPathForSave });
        
              chrome.storage.sync.set({ savedUrls: savedUrls }, () => { });
              alert("Filter saved. Click on the extension to view the filter.");
            });
          });
        

          saveButton.addEventListener('mouseenter', function () {
            saveButton.style.backgroundColor = '#329b37';
          });

          saveButton.addEventListener('mouseleave', function () {
            saveButton.style.backgroundColor = '#357938';
          });

          if(!targetDiv.querySelector('#save-filter-btn')){
            debugLog('Appending button to targetDiv');
            targetDiv.appendChild(saveButton);
            debugLog('Button appended successfully!');
          }
         
          btnClear.addEventListener('click', function () {
            saveButton.remove();
          });
          
        }
        clearInterval(interval);
      } else {
        clearInterval(interval);
      }
    }, 4000);
  });

  const targetNode = document.querySelector('.search-bar.search-advanced');
  debugLog('MutationObserver targetNode:', targetNode);


  const observer = new MutationObserver((mutationsList, observer) => {
      debugLog('MutationObserver triggered, mutations:', mutationsList.length);
      for (let mutation of mutationsList) {
        const saveButton = document.getElementById('save-filter-btn');
        const btnSearch = document.querySelector('.search-btn');

        const divControlsCenter = document.querySelector('.controls-center');

        if(divControlsCenter.querySelector('#save-filter-btn')){
          saveButton.remove();
        }
        
        btnSearch.addEventListener('click', function () {
          
          saveButton.textContent = 'Save Filter';
          saveButton.id = 'save-filter-btn';
          saveButton.style.backgroundColor = '#357938';
          saveButton.style.color = 'white';
          saveButton.style.border = 'none';
          saveButton.style.cursor = 'pointer';
          saveButton.style.marginLeft = '10px';
          saveButton.style.fontSize = '13px'

      
          if(divControlsCenter.querySelector('#save-filter-btn')){
            saveButton.remove();
          }else{
            divControlsCenter.appendChild(saveButton);
          }

          setTimeout(() => {
              divControlsCenter.appendChild(saveButton);
          }, 2000);
        });
      }
  });

  
  const config = { 
      childList: true,
      subtree: true,
      attributes: true
  };


  observer.observe(targetNode, config);
});


