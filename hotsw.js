'use strict';

const version = 'hotresearch_swc_1';

const offlinePage = [

    '/OFFLINE/index.html',
	
	'/OFFLINE/Public/Js/Script.js',
    
    '/OFFLINE/Public/Js/md5.js',
	
	'/OFFLINE/Public/Js/Dialog.js',
	
	'/OFFLINE/Public/Js/Valid.js',
	
	'/OFFLINE/Public/Js/Worker.js',
	
	'/OFFLINE/Public/Css/Style.css',
    
    '/OFFLINE/Public/Font/opensans-300-normal.ttf',
    
    '/OFFLINE/Public/Font/opensans-300-normal.woff',
    
    '/OFFLINE/Public/Font/opensans-300-normal.woff2',
    
    '/OFFLINE/Public/Favicon/android-chrome-192x192.png',
    
    '/OFFLINE/Public/Favicon/android-chrome-256x256.png',
    
    '/OFFLINE/Public/Favicon/apple-touch-icon.png',
    
    '/OFFLINE/Public/Favicon/browserconfig.xml',
    
    '/OFFLINE/Public/Favicon/favicon-16x16.png',
    
    '/OFFLINE/Public/Favicon/favicon-32x32.png',
    
    '/OFFLINE/Public/Favicon/favicon.ico',
    
    '/OFFLINE/Public/Favicon/mstile-150x150.png',
    
    '/OFFLINE/Public/Favicon/safari-pinned-tab.svg',
    
    '/OFFLINE/Public/Favicon/site.webmanifest'
        
];

const urlBlacklist = [];

function updateStaticCache() {
    return caches.open(version)
        .then(cache => {
            return cache.addAll(
                offlinePage
            );
        });
}

function clearOldCaches() {
    return caches.keys().then(keys => {
        return Promise.all(
            keys
                .filter(key => key.indexOf(version) !== 0)
                .map(key => caches.delete(key))
        );
    });
}

function isHtmlRequest(request) {
    return request.headers.get('Accept').indexOf('text/html') !== -1;
}


function isBlacklisted(url) {
    return urlBlacklist.filter(bl => url.indexOf(bl) == 0).length > 0;
}


function isCachableResponse(response) {
    return response && response.ok;
}


self.addEventListener('install', event => {
    event.waitUntil(
        updateStaticCache()
            .then(() => self.skipWaiting())
    );
});


self.addEventListener('activate', event => {
    event.waitUntil(
        clearOldCaches()
            .then(() => self.clients.claim())
    );
});


self.addEventListener('fetch', event => {
	
    let request = event.request;

    if (request.method !== 'GET') {
        
        if (!navigator.onLine && isHtmlRequest(request)) {
			
            return event.respondWith(caches.match(offlinePage));
			
        }
		
        return;
		
    }

    if (isHtmlRequest(request)) {
        
        event.respondWith(
		
            fetch(request)
			
                .then(response => {
					
                    if (isCachableResponse(response) && !isBlacklisted(response.url)) {
						
                        let copy = response.clone();
						
                        caches.open(version).then(cache => cache.put(request, copy));
						
                    }
					
                    return response;
					
                })
				
                .catch(() => {
					
                    return caches.match(request)
					
                        .then(response => {

                            if (!response && request.mode == 'navigate') {
								
                                return caches.match(offlinePage);
								
                            }
							
                            return response;
							
                        });
						
                })
				
        );
		
    } else {
		
		if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin')
			
			  return
		  
				event.respondWith(
		
					fetch(request)
					
						.then(response => {
							
							if (isCachableResponse(response) && !isBlacklisted(response.url)) {
								
								let copy = response.clone();
								
								caches.open(version).then(cache => cache.put(request, copy));
								
							}
							
							return response;
							
						})
						
						.catch(() => {
							
							return caches.match(request)
							
								.then(response => {

									if (!response && request.mode == 'navigate') {
										
										return caches.match(offlinePage);
										
									}
									
									return response;
									
								});
								
						})
						
				);
		
    }
	
});