let MEDIACONTEXT = [];

let OPTMEDIA = {
    
    audio: {
        
      tag: 'audio',
      
      type: 'audio/ogg; codecs=opus',
      
      ext: '.ogg',
      
      gUM: {audio: true}
      
    }
        
};

let RECORDER;

let RECORDTIME;

let RECORDTIMER = {
    
    sec: 0,
    
    min: 0,
    
    hour: 0
    
}

function setCursorPosition(pos, elem) {
	
  elem.focus();
  
  if (elem.setSelectionRange) elem.setSelectionRange(pos, pos);
  
  else if (elem.createTextRange) {
	  
    let range = elem.createTextRange();
	
    range.collapse(true);
	
    range.moveEnd('character', pos);
	
    range.moveStart('character', pos);
	
    range.select();
	
  }
  
}

function TelInput(el) {
  
  let matrix = el.placeholder;
  
  let i = 0;
  
  let def = matrix.replace(/\D/g, '');
  
  let val = el.value.replace(/\D/g, '');
  
  def.length >= val.length && (val = def);
  
  matrix = matrix.replace(/[_\d]/g, function(a) {
	  
    return val.charAt(i++) || '_';
	
  });
  
  el.value = matrix;
  
  i = matrix.lastIndexOf(val.substr(-1));
  
  i < matrix.length && matrix != el.placeholder ? i++ : i = matrix.indexOf('_');
  
  setCursorPosition(i, el)
  
}

let elem = function(el, opt) {

	this.type = opt.type || false;
	
	this.id = opt.id || false;
	
	this.classname = opt.classname || false;
	
	this.name = opt.name || false;
	
	this.value = opt.value || false;
	
	this.title = opt.title || false;
	
	this.textcontent = opt.textcontent || false;
	
	this.innerhtml = opt.innerhtml || false;
	
	this.pattern = opt.pattern || false;
	
	this.placeholder = opt.placeholder  || false;
	
	this.attr = opt.attr || false;

	this.attr && (this.attrlist = this.attr.split('*'));
	
	this.addevent = opt.addevent || false;
	
	this.src = opt.src || false;
	
	this.entity = document.createElement(el);
	
	this.type && (this.entity.type = this.type);
	
	this.classname && (this.entity.className = this.classname);
	
	this.title && (this.entity.title = this.title);
	
	if (this.addevent == 'click_') {
		
		this.entity.addEventListener('click', al);
		
	} else {
		
		this.addevent && typeof(this.addevent) == 'string' && (this.entity.addEventListener(this.addevent, listener))
		
	}
	
	if (this.addevent && typeof(this.addevent) == 'object') for (let y in this.addevent) this.entity.addEventListener(this.addevent[y], listener);
	
	if (this.attr) for (let y in this.attrlist) this.entity.setAttribute(this.attrlist[y].split('=')[0], this.attrlist[y].split('=')[1] || '');
	
	switch (el) {
		
		case 'div': case 'table': case 'tr': case 'td': case 'label': case 'span': case 'option': case 'datalist': case 'button': case 'dialog': case 'textarea': case 'select': case 'img':
		
			this.id && ((el == 'label') ? this.entity.setAttribute('for', this.id) : this.entity.id = this.id);
			
			this.textcontent && (this.entity.textContent = this.textcontent);
			
			this.innerhtml && (this.entity.innerHTML = this.innerhtml);
			
			this.src && (this.entity.src = this.src);
		
		break;
		
		case 'input':
		
			this.id && (this.entity.id = this.id);
			
			this.name && (this.entity.name = this.name);
			
			this.value && (this.entity.value = this.value);

			switch (this.type) {
			
				case 'checkbox': case 'radio': case 'button':
				
					
				
				break;
				
				 case 'number': case 'text': case 'tel':
				
					this.textcontent && (this.entity.textContent = this.textcontent);
					
					this.pattern && (this.entity.pattern = this.pattern);
					
					this.placeholder && (this.entity.placeholder = this.placeholder);
				
				break;
			
			}
	
		break;
	
	}
	
	return this.entity;
	
}

function makeMediaContext() {
    
    let mediaBlob = new Blob(MEDIACONTEXT, {type: OPTMEDIA.audio.type});
    
    let reader = new FileReader();
    
    reader.onload = function(event) {
		
		MEDIA.Context.push(event.target.result);
		
		MEDIA.Time.push(RECORDTIME);
	
		DB.transaction('Media', 'readwrite').objectStore('Media').put({Id: ITEM.Id, ProjectId: PROJECT.id, Data: MEDIA});

		MEDIACONTEXT = [];
		
		MEDIA = {};

    }
    
    reader.readAsDataURL(mediaBlob);
    
}

function getRecordPerm() {
    
    navigator.mediaDevices.getUserMedia(OPTMEDIA.audio.gUM).then(_stream => {
	    
        let stream = _stream;

        RECORDER = new MediaRecorder(stream);
    
        RECORDER.ondataavailable = e => {
            
            MEDIACONTEXT.push(e.data);
            
            if (RECORDER.state == 'inactive') makeMediaContext();
          
        };
    
        RECORDPERMISSION = true;
        
    }).catch(_err => {
        
        RECORDPERMISSION = false;

        console.log('Record permission: False');
		
		al('NotRecordPermission');
        
    });
    
}

function GetDate(record = false, state = false, date = false, min = false) {

    if (record) {
		
		let d = '[' + new Intl.DateTimeFormat('ru-RU', {day: 'numeric', month: 'long', year: 'numeric'}).format(new Date()).replace(/.$/, '') + ']';
	
		let t = '[' + new Intl.DateTimeFormat('ru-RU', {hour: 'numeric', minute: 'numeric', second: 'numeric'}).format(new Date()).replace(/:/g, '-') + ']';
        
        return state ? d + t : t;
        
    } else if (min) {
		
		return new Intl.DateTimeFormat('ru-RU', {day: 'numeric', month: '2-digit', year: '2-digit'}).format(date ? new Date(date) : new Date());
		
	} else return new Intl.DateTimeFormat('ru-RU', {year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'}).format(date ? new Date(date) : new Date());
    
}

function RecordTimer() {
    
    RECORDTIMER.sec ++;
    
    if (RECORDTIMER.sec == 60) {
        
        RECORDTIMER.min ++;
        
        RECORDTIMER.sec = 0;
        
        if (RECORDTIMER.min == 60) {
            
            RECORDTIMER.hour ++;
        
            RECORDTIMER.min = 0;
  
        }
        
    }
    
    document.querySelector('.top-timer').textContent = RECORDTIMER.hour + ':' + (RECORDTIMER.min < 10 ? '0' + RECORDTIMER.min : RECORDTIMER.min) + ':' + (RECORDTIMER.sec < 10 ? '0' + RECORDTIMER.sec : RECORDTIMER.sec);
    
}

function Cleaner() {
	
	if (arguments.length) for (a in arguments) {
	
		while (arguments[a].firstChild) arguments[a].removeChild(arguments[a].firstChild);
		
	}
	
}

function getOffset(el) {
	
    let Result = {
		
		Left: 0,
	
		Top: 0,
	
		Width: el.offsetWidth,
	
		Height: el.offsetHeight
		
	}
	
    do if (! isNaN(el.offsetLeft)) {
		
		Result.Left += el.offsetLeft;
		
		Result.Top += el.offsetTop;
		
	}

	while(el = el.offsetParent);
	
    return Result;
	
}