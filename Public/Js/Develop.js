window.addEventListener('resize', function(event) {
	
    VW = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
	
	VH = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
	
	document.querySelector('.develop-window').textContent = VW + 'x' + VH + (MOBILE ? ' M' : ' PC');
	
}, true);

document.addEventListener('DOMContentLoaded', function() {

	VW = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
	
	VH = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
	
	document.querySelector('.develop-window').textContent = VW + 'x' + VH + (MOBILE ? ' M' : ' PC');

	document.querySelector('.develop-window').classList.remove('hidden');

});