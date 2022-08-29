// 2

if ('serviceWorker' in navigator) navigator.serviceWorker.register('/OFFLINE/hotsw.js', { scope: '/OFFLINE/' }).then(function(registration) {}).catch(function(err) {});

window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;

window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

let MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent);

let ABORTED = false;

let AD = {};

let AUTHDATA = {};

let AUTOFILLRULES = {};

let CANSEND = false;

let ColsQuantity = 1;

let DATACOMPLETED = {};

let DB;

let DIRECTRULES = {};

let FILEDATA = {};

let HIO = [];

let HISTORY = false;

let HISTORYDATA = {};

let ITEM;

let DBAVAILABLE = !! window.indexedDB;

let LIMIT= [];

let LIST = {};

let LISTINDEX = 0;

let LOGDATA;

let LOGINDEX;

let MEDIA;

let PROJECT = {};

let PROJECTDATA = {};

let PROJECTLIST = [];

let PARENT;

let PROMPTRESULT;

let PTDATA = {};

let QDATA = {};

let QB;

let QH;

let QN;

let QND = true;

let RECORD = false;

let RECORDPERMISSION = false;

let REGTYPE;

let RESP;

let RowsQuantity = 1;

let RULES = {};

let RULESDATA = [];

let RULESTRIGGER = {};

let SENDINDEX;

let SENDFILES = false;

let STATEINDEX = 1;

let TIMERCALL;

let TRACKER = [];

let VISUALRULES = {};

let VW, VH;

let UID = 0;

let DBRequest = indexedDB.open('HotResearchDatabase');
	
DBRequest.onupgradeneeded = function() {

	DB = DBRequest.result;
	
	DB.onerror = function(event) {
		
		console.error('Database error: ' + event.target.errorCode);
    
	};
	
	DB.createObjectStore('Projects', {keyPath: 'Id', autoIncrement: true}).createIndex('ProjectId', 'ProjectId');
	
	DB.createObjectStore('Rules', {keyPath: 'Id', autoIncrement: true}).createIndex('ProjectId', 'ProjectId');
	
	DB.createObjectStore('Items', {keyPath: 'Id', unique: true}).createIndex('ProjectId', 'ProjectId');

	DB.createObjectStore('Media', {keyPath: 'Id', unique: true}).createIndex('Id', 'Id');
	
}

DBRequest.onsuccess = function() {
	
	DB = DBRequest.result;
  
}

DBRequest.onerror = function() {

	console.error('Error', DBRequest.error);
  
}

document.addEventListener('DOMContentLoaded', function() {
	
	if (DBAVAILABLE) {
	
		ImportJS('md5, Dialog, Valid, WorkerL');
		
		QN = document.querySelector('#QName');
			
		QH = document.querySelector('#QHeader');
		
		QB = document.querySelector('#QBody');
		
		BC = document.querySelector('#QButton');
		
		let StorageLOGDATA = storage('LOGDATA');
							
		if (StorageLOGDATA) {
			
			LOGDATA = JSON.parse(storage('LOGDATA'));
			
			document.querySelector('#LogData1').value = LOGDATA[0];
			
			document.querySelector('#LogData2').value = LOGDATA[1];
		
		}
		
		CANSEND = true;
	
	} else {
		
		document.querySelector('#LoginPage').classList.add('hidden');
		
		alert('Для работы приложения требуется более новая версия браузера');
		
	}
        
});

let Item = function() {
    
    this.StateIndex = 1;
    
    this.Data = {};
	
	this.History = [];
    
    this.Status = 1;
    
    this.Date = new Date();
	
	this.Owner = [];
	
	this.NeedRecord = false;

    return this;
    
}

let Media = function() {
	
	this.Context = [];
		
	this.Time = [];

	return this;
	
}

let ImportJS = function(js) {
	
	[].forEach.call(js.split(', '), function(uri) {
	
		let script = document.createElement('script');
	
		script.src  = 'Public/Js/' + uri.trim() + '.js';
	
		document.head.appendChild(script);
		
	});
	
}

function SendRequest(location, param) {
	
	let R = false;
	
	if (window.XMLHttpRequest) {
		
		R = new XMLHttpRequest();

	} else if (window.ActiveXObject) {

		try {
			
			R = new ActiveXObject('Msxml2.XMLHTTP');
			
		} catch (e) {
		
			try {
				
				R = new ActiveXObject('Microsoft.XMLHTTP');
				
			} catch (e) {}
			
		}
	
	}
	
	if (R) {
		
		R.upload.onprogress = function(e) {
            
            if (e.lengthComputable && SENDFILES) {
                
                let Progress = Math.round(e.loaded * 100 / e.total);

                document.querySelector('#Item' + SENDINDEX + ' #SendFiles').textContent = Progress == 100 ? 'Почти готово...' : Progress + ' %';

            }
        
	        
	    }
	    
	    R.upload.onerror = function() {
			
			CANSEND = true;
			
			SENDFILES = false;
			
			document.querySelector('#Item' + SENDINDEX + ' #SendFiles').textContent = 'Отправить';
	        
            al('NotSend');
            
        }
		
		R.onreadystatechange = function() {
			
			if (R.readyState == XMLHttpRequest.DONE) { 
			    
			    CANSEND = true;
			
				if (R.status == 200 && R.responseText.length) {
					
					RESP = JSON.parse(R.responseText);

					switch (RESP.Action) {
						
						case 'Resume':
						
							PROJECTLIST[RESP.Index].Owner = LOGDATA;
						
							PROJECTLIST[RESP.Index].Status = PROJECTLIST[RESP.Index].NeedRecord ? 5 : 4;
							
							DB.transaction('Items', 'readwrite').objectStore('Items').put({Id: PROJECT.id + ':' + RESP.Index, ProjectId: PROJECT.id, Data: PROJECTLIST[RESP.Index]});
							
							DB.transaction('Media', 'readwrite').objectStore('Media').delete(PROJECT.id + ':' + RESP.Index).onsuccess = function(e) {
									
								document.querySelector('#Abort').click();
							
							}
	
						break;

						case 'Upload':
						
							if (RESP.Successful) {
								
								PROJECTLIST[RESP.Index].Status = 4;
								
								DB.transaction('Items', 'readwrite').objectStore('Items').put({Id: PROJECT.id + ':' + RESP.Index, ProjectId: PROJECT.id, Data: PROJECTLIST[RESP.Index]});
								
								document.querySelector('#File').value = '';
								
								document.querySelector('#Item' + SENDINDEX + ' tr[class*=file-list-container]').classList.add('hidden');
								
								//document.querySelector('#Item' + SENDINDEX + ' #SelectFiles').classList.add('hidden');
								
								document.querySelector('#Item' + SENDINDEX + ' #ListOwner').textContent = 'Всё отправлено';
								
							} else {
								
								document.querySelector('#Item' + SENDINDEX + ' #SendFiles').textContent = 'Отправить';
								
								al('NotSend');
								
							}
							
							SENDFILES = false;
						
						break;
		                
		                case 'Reject': 
						
							document.querySelector('#Login').classList.remove('preloader');
						
							al('LoginError');
		                    
		                break;

						case 'Failure': 
						
							document.querySelector('#Item' + SENDINDEX + ' #SendItem').classList.remove('preloader');
						
							al('NotSend');
		                    
		                break;	
						
						case 'Welcome':
						
							PROJECT = RESP.Project;
							
							PROJECTDATA = RESP.ProjectData;
							
							RULESDATA = RESP.RulesData;
							
							HISTORY = PROJECT.History == 'ON' ? true : false;
							
							QND = PROJECT.QNHidden == 'ON' ? false : true;
							
							LOGDATA = [document.querySelector('#LogData1').value, document.querySelector('#LogData2').value];
							
							storage('LOGDATA', JSON.stringify(LOGDATA));
							
							storage('PROJECT' + PROJECT.id, JSON.stringify(PROJECT));
							
							DB.transaction('Projects', 'readwrite').objectStore('Projects').put({ProjectId: PROJECT.id, Data: PROJECTDATA});
							
							DB.transaction('Rules', 'readwrite').objectStore('Rules').put({ProjectId: PROJECT.id, Data: RULESDATA});

							RECORD = /\[RECORD\]/.test(PROJECT.Version);
							
							if (RECORD) getRecordPerm();
							
							PageManager.Page('HomePage');
							
						break;
						
				    }
		
				} if (R.status == 0) {
					
					document.querySelector('#Login').classList.remove('preloader');
					
					al('NotInternet');
					
				}
			
			}
			
		}
		
		CANSEND = false;
		
		R.open('POST', location);

		R.send(param);
		
	} else console.log("NOT AJAX");
	
}

let PageManager = {
	
	HomePage: function(Page, Reload) {
		
		if (Reload) {
			
			QN.innerHTML = '';
	
			QH.innerHTML = '';
			
			QB.innerHTML = '';
			
			document.querySelector('#MainContainer').classList.add('hidden');
			
			document.querySelector('#TopContainer').classList.add('hidden');
		
		}
		
		document.querySelector('.project-name-container').textContent = PROJECT.Name;
		
		if (PROJECT.Description) document.querySelector('.project-description-container').innerHTML = PROJECT.Description;
		
		else document.querySelector('.project-description-container').classList.add('hidden');
		
		if (PROJECTLIST.length) {
			
			[].forEach.call(PROJECTLIST, function(L, i) {

				let Item = document.querySelector('#ListItem' + (MOBILE ? 'Mobile' : '')).cloneNode(true);
				
				Item.id = 'Item' + (i + 1);
				
				Item.setAttribute('data-index', i);
				
				Item.querySelector('#ListId').textContent = (i + 1);
				
				Item.querySelector('#ListDate').textContent = GetDate(false, false, L.Date, MOBILE);
				
				Item.querySelector('#ListProgress').textContent = GetProgress(L.StateIndex);
				
				if (PROJECT.Provisional != null) {
					
					let PPR = PROJECT.Provisional.split(',');
					
					[].forEach.call(PPR, function(P) {
						
						if (L.hasOwnProperty('Data') && L.Data.hasOwnProperty(P)) {
						
							let Element = new elem('span', {classname: 'span-prov', textcontent: L.Data[P][0]});
						
							Item.querySelector('#ListProvisional').append(Element);
							
						}
						
					});
					
				}
				
				if (L.NeedRecord) Item.querySelector('#ListNote').textContent = 'Нет аудио';
				
				let Owner;
				
				switch (L.Status) {
					
					case 1: // Продолжить

						if (MOBILE) {
							
							Item.querySelector('#Resume').classList.add('hidden');
						
							Item.classList.add('pointer');

							Item.addEventListener('click', listener);
							
						} else Item.querySelector('#Resume').addEventListener('click', listener);
						
					break;
					
					case 2: // Отправить

						Item.querySelector('#SendItem').addEventListener('click', listener);
						
						Item.querySelector('#SendItem').classList.remove('hidden');
						
						Item.querySelector('#ListProgress').classList.add('hidden');
						
						Item.querySelector('#Resume').classList.add('hidden');
						
					break;
					
					case 3: // Прервано
					
						Item.querySelector('#ListProgress').classList.add('hidden');
					
						Item.querySelector('#Resume').classList.add('hidden');
					
					break;
					
					case 4: case 5: // 4- Всё отправлено, 5 - Отправлена только анкета
					
						Owner = Item.querySelector('#ListOwner');
						
						Owner.textContent = L.Status == 4 ? 'Всё отправлено' : 'Отправлена только анкета';
					
						Owner.classList.remove('hidden');
						
						Item.querySelector('#ListProgress').classList.add('hidden');
					
						Item.querySelector('#Resume').classList.add('hidden');
						
						Item.querySelector('.file-list-container :first-child').colSpan = Item.querySelector('tr:first-child').childElementCount - 3;

						Item.querySelector('#SelectFiles').setAttribute('data-index', i);
				
						Item.querySelector('#SelectFiles').addEventListener('click', listener);
						
						Item.querySelector('#SelectFiles').classList.remove('hidden');
						
						Item.querySelector('#SendFiles').setAttribute('data-index', i);
				
						Item.querySelector('#SendFiles').addEventListener('click', listener);

						Item.addEventListener('dblclick', listener);
					
					break;
						
				}
				
				Item.classList.remove('hidden');
				
				Item.classList.add('item-container');
			
				Page.querySelector('#ListContainer').append(Item);
				
			});
			
		}
		
		document.querySelector('#LoginPage').classList.add('hidden');
		
		Page.classList.remove('hidden');
		
		return true;
		
	},
	
	MainContainer: function(Page, Reload) {
		
		if (Reload) {
			
			QN.innerHTML = '';
	
			QH.innerHTML = '';
			
			QB.innerHTML = '';
		
		} else {
			
			document.querySelector('#HomePage').classList.add('hidden');
			
			Page.classList.remove('hidden');
			
			document.querySelector('#TopContainer').classList.remove('hidden');
			
			document.querySelector('.top-project-name').textContent = PROJECT.Name;
			
			[].forEach.call(LOGDATA, function(a, i) { document.querySelector('.top-data' + (i + 1)).textContent = a });
			
		}
		
		if (PROJECT.Progress) document.querySelector('.top-progress').textContent = GetProgress(STATEINDEX);
		
		QDATA = PROJECTDATA[STATEINDEX - 1];
		
		builder();
		
	},
	
	Page: function(PageId, Reload = false) {
		
		let Page = document.querySelector('#' + PageId);
		
		let Result = this[PageId](Page, Reload);
		
		return Result;
		
	}	
	
}

let Map = {
	
	Contains: function(R, TX, A) {

		if (A) {
			
			
			
		} else {
			
			if (TX.length > 1) {
			
				let Ti;
								
				for (Ti = TX[0]; Ti <= TX[1]; Ti ++) if (R.includes(Ti.toString())) return true;
					
				return false;
			
			} else if (R.includes(TX[0])) return true;
		
			return false;
			
		}

	},
	
	NotEqual: function(R, TX, A) {
		
		if (A) {
			
			return ((A == 'DISPLAY' && + R[0] == TX[0]) || (A == 'NOT DISPLAY' && + R[0] != TX[0]));
			
		} else {
			
			
			
		}
		
	},
	
	Between: function(R, TX, A) {
		
		if (A) {
			
			return ((A == 'DISPLAY' && (+ R[0] < TX[0] || + R[0] > TX[1])) || (A == 'NOT DISPLAY' && + R[0] >= TX[0] && + R[0] <= TX[1]));
			
		} else {
			
			
			
		}
		
	},
	
	Result: function(R, T, O, A = false) {
		
		TX = T.split('-');

		switch (O) {
			
			case 'CONTAINS': Result = this.Contains(R, TX, A);
			
			break;
			
			case 'NOT EQUAL': Result = this.NotEqual(R, TX, A);
			
			break;
			
			case 'BETWEEN': Result = this.Between(R, TX, A);
			
			break;
			
		}
		
		return Result;
		
	}
	
}

function MakeArray(String) {
	
	let A1 = String.split(',');
	
	let A2;
	
	let Result = [];
	
	for (let i in A1) {
		
		if (A1[i].indexOf('-') !== -1) {
			
			A2 = A1[i].split('-');
			
			for (let j = A2[0]; j <= A2[1]; j ++) Result.push(j.toString());
			
		} else Result.push(A1[i]);
		
	}
	
	return Result;
	
}

function NodeChange(Node, A) {
	
	switch (A) {
		
		case 'ON':
		
			if (Node.nodeName == 'TR') {
		
				[].forEach.call(Node.querySelectorAll('input'), function(i) { i.removeAttribute('data-not-required') });
					
				Node.classList.remove('hidden');
			
			}

		break;
		
		case 'OFF':
		
			if (Node.nodeName == 'TR') {
		
				if (typeof(Node.dataset.protect) == 'undefined') {
			
					[].forEach.call(Node.querySelectorAll('input'), function(i) { 
					
						i.setAttribute('data-not-required', '');
						
						if (i.type == 'checkbox' || i.type == 'radio') i.checked = false;
						
						if (i.type != 'checkbox' && i.type != 'radio') i.value = '';
						
					});
						
					Node.classList.add('hidden');
					
				}
			
			} else {

				[].forEach.call(QB.querySelectorAll('td[data-n="' + Node + '"]:not([data-protect])'), function(td) {
								
					let TargetInput = td.querySelectorAll('input:not([class*="text-module"], [data-protect])');
					
					if (TargetInput != null) [].forEach.call(TargetInput, function(inp) {
							
						inp.setAttribute('data-not-required', '');
						
						(inp.type == 'number' || inp.type == 'text') && (inp.value = '');
						
					});
				
					td.classList.add('hidden');
					
					QH.querySelector('th[data-n="' + Node + '"]').classList.add('hidden');
					
				});
				
			}
			
		break;
		
	}
	
}

function VisualRuleProcessing() {
	
	let EnList = [];
	
	let RD;
		
	for (let Rule in RESP.RuleData) {
		
		RD = RESP.RuleData[Rule];
	
		let Success = false;
			
		let ResponseGroups;

		let MatchIndex;
	
		let Response;
			
		let ResponseData = {Value: [], Data: []};
					
		switch (RD.Selection) {
			
			case 'ROW': case 'COL':
			
				if (RD.ResponseData.length > 1) {
					
					let TX = MakeArray(RD.Target);
					
					[].forEach.call(RD.ResponseData, function(RDV) {
						
						ResponseGroups = RDV.QResponse.match(/(?<val>[\d,]+)-?(?<data>.+)?/);
						
						if (ResponseGroups != null) {

							switch (RD.Operation) {
								
								case 'EQUAL': case 'NOT EQUAL':
								
									Success = (RD.Operation == 'EQUAL' && ResponseGroups.groups.val == TX[0]) || (RD.Operation == 'NOT EQUAL' && ResponseGroups.groups.val != TX[0]);
									
								break;
								
								case 'MORE': case 'NOT MORE':
								
									Success = (RD.Operation == 'MORE' && ResponseGroups.groups.val > TX[0]) || (RD.Operation == 'NOT MORE' && ResponseGroups.groups.val <= TX[0]);
									
								break;

								case 'LESS': case 'NOT LESS': 
								
									Success = (RD.Operation == 'LESS' && ResponseGroups.groups.val < TX[0]) || (RD.Operation == 'NOT LESS' && ResponseGroups.groups.val >= TX[0]);
									
								break;

								case 'CONTAINS': case 'NOT CONTAINS':
								
									let QX = MakeArray(ResponseGroups.groups.val);
									
									for (let i = 0; i < QX.length; i ++) {
										
										if ((RD.Operation == 'CONTAINS' && TX.includes(QX[i])) || (RD.Operation == 'NOT CONTAINS' && ! TX.includes(QX[i]))) {
											
											Success = true;
											
											break;
											
										}
										
									}
								
								break;
								
								case 'BETWEEN': case 'NOT BETWEEN':
								
									Success = (RD.Operation == 'BETWEEN' && ResponseGroups.groups.val >= TX[0] && ResponseGroups.groups.val <= TX[1]) || (RD.Operation == 'NOT BETWEEN' && (ResponseGroups.groups.val < TX[0] || ResponseGroups.groups.val > TX[1]));

								break;
								
								
							}
						
						}
						
						if (Success == true) {
							
							ResponseData.Value.push(RDV.QName.match(/_(\d+)$/, '')[1]);
							
							ResponseData.Data.push(typeof(ResponseGroups.groups.data) != 'undefined' ? ResponseGroups.groups.data : '');
							
							Success = false;
							
						}
						
					});
					
				} else {
					
					Response = RD.ResponseData[0].QResponse.split(',');
						
					[].forEach.call(Response, function(y) {
						
						ResponseGroups = y.match(/(\d+)-?(.+)?/);
						
						if (ResponseGroups != null) {
							
							ResponseData.Value.push(ResponseGroups[1]);
							
							ResponseData.Data.push(typeof(ResponseGroups[2]) != 'undefined' ? ResponseGroups[2] : '');
							
						}
						
					});
					
				}
				
				if (RD.Selection == 'ROW') {
					
					for (let i = 1; i <= RowsQuantity; i ++) {
						
						MatchIndex = ResponseData.Value.indexOf(i.toString());
			
						let Row = QB.querySelector('tr.string[data-string-index="' + i + '"]');

						if ((RD.Action == 'DISPLAY' && MatchIndex > -1) || (RD.Action == 'NOT DISPLAY' && MatchIndex == -1)) {
							
							if (ResponseData.Data[MatchIndex] != null && ResponseData.Data[MatchIndex] != '') {
								
								Row.querySelector('input').removeAttribute('data-prompt');

								Row.querySelector('.row').textContent = ResponseData.Data[MatchIndex];

							}
							
						} else NodeChange(Row, 'OFF');
						
					}
					
				} else {

					for (let i = 1; i <= ColsQuantity; i ++) {
						
						MatchIndex = ResponseData.Value.indexOf(i.toString());
						
						if ((RD.Action == 'DISPLAY' && MatchIndex > -1) || (RD.Action == 'NOT DISPLAY' && MatchIndex == -1)) {
							
							if (ResponseData.Data[MatchIndex] != null && ResponseData.Data[MatchIndex] != '') QH.querySelector('th[data-n="' + i + '"] div').textContent = ResponseData.Data[MatchIndex];

						} else NodeChange(i, 'OFF');
						
					}
					
				}
			
			break;
			
			case 'MSG':
				
				if (RD.Action != '') {
					
					if (RD.Target && RESP.RuleData.hasOwnProperty(RD.Target)) {

						let Exp = new RegExp('_' + RESP.RuleData[RD.Target].ResponseData[0].QResponse + '$');
						
						[].forEach.call(RD.ResponseData, function(x) {
						
							if (Exp.test(x.QName)) {
								
								let e = new elem('div', {classname: 'q-note', textcontent: RD.Action.replace('$', x.QResponse)});

								QN.append(e);
								
							}
							
						});
						
					} else {
						
						let e = new elem('div', {classname: 'q-note', textcontent: RD.Action.replace('$', RD.ResponseData[0].QResponse)});

						QN.append(e);
						
					}
					
				}
			
			break;
			
		}

	}
	
}

function builder() {

	let TableContentHLT;

	let ColMix;
	
	let ColMixData;

	let ColsData = [];
	
	let ColContentHLT;
	
	let WorkCol;
	
	let RowMix;
	
	let RowMixData;
	
	let RowsData = [];
	
	let RowContentHLT;
	
	let WorkRow;

	let RowSection;
	
	let RowSectionData;
	
	let SingleInput;
    
	let SingleData;
	
	let SingleAttr;

	let SpecialChar;
	
	let OptData;
	
	let HasInput = true;

	let WorkObject;
	
	let Complex;
	
	let ComplexLength;
	
	let InputTypeData = QDATA.InputType != null ? QDATA.InputType.split('|') : null;

	let InputDataData = QDATA.InputData != null ? QDATA.InputData.split('|') : null;
	
	let InputAttrData = QDATA.InputAttr != null ? QDATA.InputAttr.split('|') : null;
	
	let TablePropertyData = QDATA.TableProperty != null ? QDATA.TableProperty.split('|') : null;

	let ColsContentData = QDATA.ColsContent != null ? QDATA.ColsContent.split('|') : null;

	let RowsContentData = QDATA.RowsContent != null ? QDATA.RowsContent.split('|') : null;
	
	// Получение настроек для ротации -------------------------------------------------------------------------------------------
	
	if (TablePropertyData != null) {
	
		[].forEach.call(TablePropertyData, function(x) {
			
			SpecialChar = x.match(/(?<Name>[^=]+)=?(?<Data>.+)?/);
			
			if (SpecialChar != null) {
				
				if (SpecialChar.groups.Name == 'RowMix') {
					
					RowMix = true;
					
					if (SpecialChar.groups.Data != null) RowMixData = MakeArray(SpecialChar.groups.Data);
					
				}
				
				if (SpecialChar.groups.Name == 'ColMix') {
					
					ColMix = true;
					
					if (SpecialChar.groups.Data != null) ColMixData = MakeArray(SpecialChar.groups.Data);
					
				}
	
			}
			
		});

	}
	
	// --------------------------------------------------------------------------------------------------------------------------
	
	if (RowsContentData != null) {
		
		let RowsNoteData = QDATA.RowsNote != null ? QDATA.RowsNote.split('|') : null;
		
		let RowsClassData = QDATA.RowsClass != null ? QDATA.RowsClass.split('|') : null;

		[].forEach.call(RowsContentData, function(x, i) {
			
			WorkObject = {
			
				Name: x,
				
				Index: i + 1,
				
				Note: RowsNoteData != null ? (RowsNoteData.length > 1 ? RowsNoteData[i] : RowsNoteData[0]) : null,
				
				Class: RowsClassData != null ? (RowsClassData.length > 1 ? RowsClassData[i] : RowsClassData[0]) : 'row',
				
				Input: QDATA.OutMark == null && InputTypeData ? (InputTypeData.length > 1 ? InputTypeData[i] : InputTypeData[0]) : null,
				
				Data: QDATA.OutMark == null && InputDataData ? (InputDataData.length > 1 ? InputDataData[i] : InputDataData[0]) : null,
				
				Attr: QDATA.OutMark == null && InputAttrData ? (InputAttrData.length > 1 ? InputAttrData[i] : InputAttrData[0]) : ''
	
			}
			
			RowsData.push(WorkObject);
			
		});
		
		if (RowMix) shuffle(RowsData);
		
		RowsQuantity = RowsContentData.length;

	} else RowsQuantity = 1;
	
	if (ColsContentData != null) {
		
		let ColsNoteData = QDATA.ColsNote != null ? QDATA.ColsNote.split('|') : null;
		
		let ColsClassData = QDATA.ColsClass != null ? QDATA.ColsClass.split('|') : null;
		
		let ColsImgData = QDATA.ColsImg != null ? QDATA.ColsImg.split('|') : null;
		
		let FirstCol;

		[].forEach.call(ColsContentData, function(x, i) {
			
			WorkObject = {
			
				Name: x,
				
				Index: i,
				
				Note: ColsNoteData != null ? (ColsNoteData.length > 1 ? ColsNoteData[i] : ColsNoteData[0]) : null,
				
				Class: ColsClassData != null ? (ColsClassData.length > 1 ? ColsClassData[i] : ColsClassData[0]) : 'head',
				
				Img: ColsImgData != null ? (ColsImgData.length > 1 ? ColsImgData[i] : ColsImgData[0]) : null,
				
				Input: QDATA.OutMark && InputTypeData ? (InputTypeData.length > 1 ? InputTypeData[i] : InputTypeData[0]) : null,
				
				Data: QDATA.OutMark && InputDataData ? (InputDataData.length > 1 ? InputDataData[i] : InputDataData[0]) : null,
				
				Attr: QDATA.OutMark && InputAttrData ? (InputAttrData.length > 1 ? InputAttrData[i] : InputAttrData[0]) : ''

			}
			
			if (i == 0) FirstCol = WorkObject;
			
			else ColsData.push(WorkObject);
			
		});
		
		if (ColMix) {
			
			shuffle(ColsData);
			
			ColsData.unshift(FirstCol);
		
		} else ColsData.unshift(FirstCol);
		
		ColsQuantity = ColsContentData.length;

	} else ColsQuantity = RowsQuantity == 1 ? 1 : 2;

	if (ColsContentData == null && RowsContentData == null) {
		
		SingleInput = InputTypeData ? InputTypeData[0] : null;
		
		SingleData = InputDataData ? InputDataData[0] : null;
		
		SingleAttr = InputAttrData ? InputAttrData[0] : '';
		
	}

	// Выделение элементов в названии вопроса -----------------------------------------------------------------------------------
	
    TableContentHLT = [...QDATA.TableContent.matchAll(/(?<Replace>\{(?<Hlt>[^\}]+)\})/g)];
	
	if (TableContentHLT.length > 0) [].forEach.call(TableContentHLT, function(x) {
		
		QDATA.TableContent = QDATA.TableContent.replace(x.groups.Replace, '<r class="hlt">' + x.groups.Hlt + '</r>');
		
	});
	
	// --------------------------------------------------------------------------------------------------------------------------
	
	// Выделение элементов в подписи вопроса -----------------------------------------------------------------------------------
	
	if (QDATA.TableNote) {
	
		TableNoteHLT = [...QDATA.TableNote.matchAll(/(?<Replace>\{(?<Hlt>[^\}]+)\})/g)];
		
		if (TableNoteHLT.length > 0) [].forEach.call(TableNoteHLT, function(x) {
			
			QDATA.TableNote = QDATA.TableNote.replace(x.groups.Replace, '<r class="note-hlt">' + x.groups.Hlt + '</r>');
			
		});
		
	}
	
	// --------------------------------------------------------------------------------------------------------------------------
	
	// Добавление названия и дополнительной подписи вопроса ---------------------------------------------------------------------
	
	if (QDATA.TableContent) QN.append(new elem('div', {classname: 'q-name', innerhtml: (QDATA.Num && QND ? QDATA.Num + '. ' : '') + QDATA.TableContent}));
	
	if (QDATA.TableNote) QN.append(new elem('div', {classname: 'q-expl', innerhtml: QDATA.TableNote}));
	
	// --------------------------------------------------------------------------------------------------------------------------
	
	// Добавление шапки таблицы -------------------------------------------------------------------------------------------------
	
	if (ColsContentData != null) for (let i = 0; i < ColsQuantity; i ++) {
		
		let TH = new elem('th', {classname: 'header-container', attr: 'data-n=' + ColsData[i].Index});
		
		// Выделение элементов в названии столбца -------------------------------------------------------------------------------
		
		ColContentHLT = [...ColsData[i].Name.matchAll(/(?<Replace>\{(?<Hlt>[^\}]+)\})/g)];
		
		if (ColContentHLT.length > 0) [].forEach.call(ColContentHLT, function(x) {
		
			ColsData[i].Name = ColsData[i].Name.replace(x.groups.Replace, '<r class="hlt">' + x.groups.Hlt + '</r>');
			
		});
		
		// ----------------------------------------------------------------------------------------------------------------------
		
		TH.appendChild(new elem('div', {classname: ColsData[i].Class, innerhtml: ColsData[i].Name}));
		
		if (ColsData[i].Note != null) {

			SpecialChar = ColsData[i].Note.match(/^.*(?<Replace>$(?<Var>.+)$).*/);
			
			TH.appendChild(new elem('div', {classname: 'note', textcontent: SpecialChar != null ? ColsData[i].Note.replaceAll(SpecialChar.groups.Replace, RULESDATA[SpecialChar.groups.Var.replace(/\./g, '_')].ResponseData[0].QResponse) : ColsData[i].Note}));

		}

		QH.appendChild(TH);
		
	}
	
	// --------------------------------------------------------------------------------------------------------------------------
	
	// Добавление строк таблицы -------------------------------------------------------------------------------------------------
		
	for (let RowIndex = 0, id = 0; RowIndex < RowsQuantity; RowIndex ++) {
		
		if (RowsData.length) {
			
			WorkRow = RowsData[RowIndex];
			
		}
		
		// Добавление разделителя строк на секции -------------------------------------------------------------------------------
		
		WorkRow && (RowSectionData = WorkRow.Name.match(/^(?<Replace>#(?<Section>.*)#).*/));
		
		if (RowSectionData != null) {
			
			WorkRow.Name = WorkRow.Name.replace(RowSectionData.groups.Replace, '');
			
			RowSection = new elem('tr', {classname: 'Section-string'});
			
			RowSection.append(new elem('td', {attr: 'colspan=' + ColsQuantity, innerhtml: RowSectionData.groups.Section}));
			
			QB.appendChild(RowSection);
			
		}
		
		// ----------------------------------------------------------------------------------------------------------------------
		
		let TR = new elem('tr', {classname: 'string', attr: 'data-string-index=' + (WorkRow ? WorkRow.Index : RowIndex)});
		
		let PromptEl;
		
		// Добавление столбцов таблицы ------------------------------------------------------------------------------------------
		
		for (let ColIndex = 0; ColIndex < ColsQuantity; ColIndex ++) {
			
			if (ColsData.length) {

				WorkCol = ColsData[ColIndex];
				
			}
			
			let TD = new elem('td', {classname: 'input-container', attr: 'data-n=' + (WorkCol ? WorkCol.Index : ColIndex) + (WorkCol && WorkCol.Attr != '' ? '*' + WorkCol.Attr : '')});
			
			if (ColIndex > 0 || RowsQuantity == 1) {
				
				id ++;
				
				let WorkInputType = WorkRow && WorkRow.Input ? WorkRow.Input : (WorkCol && WorkCol.Input ? WorkCol.Input : SingleInput);
				
				if (WorkInputType == null) {
				
					HasInput = false;
					
					DATACOMPLETED.hasOwnProperty(QDATA.Num) || (DATACOMPLETED[QDATA.Num] = ['NODATA', [], '']);
					
					break;
					
				}
				
				let WorkInputData = WorkRow ? WorkRow.Data : (WorkCol ? WorkCol.Data : SingleData);
				
				let WorkInputAttr = SingleAttr ? SingleAttr : '';
				
				if (WorkRow && WorkRow.Attr) WorkInputAttr += (WorkInputAttr != '' ? '*' : '') + WorkRow.Attr;
				
				if (WorkCol && WorkCol.Attr) WorkInputAttr += (WorkInputAttr != '' ? '*' : '') + WorkCol.Attr;

				if (WorkInputAttr != '') {
				
					SpecialChar = WorkInputAttr.match(/^.*(?<Replace>$(?<Var>.+)$).*/);
					
					if (SpecialChar != null) WorkInputAttr = WorkInputAttr.replaceAll(SpecialChar.groups.Replace, RULESDATA[SpecialChar.groups.Var.replace(/\./g, '_')].ResponseData[0].QResponse);
					
				}
				
				if (WorkInputType == 'radio' || WorkInputType == 'checkbox') {
					
					Complex = WorkInputData != null ? WorkInputData.split('*') : null;

					ComplexLength = Complex ? Complex.length : 1;
					
				} else ComplexLength = 1;
				
				if (WorkInputType == 'select') OptData = WorkInputData != null ? WorkInputData.split('*') : null;
				
				for (let ComplexIndex = 0; ComplexIndex < ComplexLength; ComplexIndex ++) {
					
					let WorkId = id + (ComplexLength > 1 ? '.' + ComplexIndex : '');
					
					let WorkValue = Complex ? ComplexIndex + 1 : (QDATA.OutMark == null ? (WorkRow ? WorkRow.Index : RowIndex) : (WorkCol ? WorkCol.Index : ColIndex));
					
					let WorkOutMark = WorkInputType == 'file' ? 'file' : QDATA.Num;
					
					if (WorkInputType == 'checkbox' || WorkInputType == 'radio') {
						
						if (ColsQuantity > 2) {
							
							WorkOutMark += '.' + (QDATA.OutMark == null ? (WorkCol ? WorkCol.Index : '') : (WorkRow ? WorkRow.Index : ''));
							
						} else if (InputTypeData.length > 1) {
							
							WorkOutMark += (WorkRow ? '.' + WorkRow.Index : '');
							
						}
						
					} else {
						
						if (ColsQuantity > 2) {
							
							WorkOutMark += '.' + (QDATA.OutMark == null ? (WorkCol ? WorkCol.Index : '') : (WorkRow ? WorkRow.Index : ''));
							
						}
						
						WorkOutMark += QDATA.OutMark == null ? (WorkRow ? '.' + WorkRow.Index : '') : (WorkCol ? '.' + WorkCol.Index : '');
						
					}
					
					switch (WorkInputType) {
						
						case 'textarea':
						
							TD.appendChild(new elem('textarea', {
						
								id: WorkId,
								
								attr: 'data-out=' + WorkOutMark + '*required*data-display-error=bottom*cols=70*data-n=' + (WorkCol ? WorkCol.Index : ColIndex) + (WorkInputAttr ? '*' + WorkInputAttr : '')
								
							}));
						
						break;
						
						case 'select':
						
							if (OptData != null) {
								
								let SEL = new elem('select', {id: WorkId, attr: 'data-out=' + WorkOutMark, addevent: 'change'});
								
								SEL.appendChild(new elem('option', {textcontent: 'Выбрать'}));
								
								[].forEach.call(OptData, function(Opt, OptIndex) {
									
									SEL.appendChild(new elem('option', {textcontent: Opt.replace(/\[t\]/, '')}));
									
									/\[t\]/.test(Opt) && (SEL.setAttribute('data-tmi', OptIndex));
									
								});

								TD.appendChild(SEL);
								
							}
						
						break;
						
						case 'text': case 'number': case 'tel':
						
							TD.appendChild(new elem('input', {
							
							type: WorkInputType, 
							
							id: WorkId,  
							
							value: WorkInputType == 'tel' ? '+7(___)___-__-__' : '',
							
							placeholder: WorkInputType == 'tel' ? '+7(___)___-__-__' : '',
							
							pattern: WorkInputType == 'tel' ? '\\+7\\s?[\\(]{0,1}9[0-9]{2}[\\)]{0,1}\\s?\\d{3}[-]{0,1}\\d{2}[-]{0,1}\\d{2}' : '',
							
							attr: 'data-out=' + WorkOutMark + '*required*data-n=' + (WorkCol ? WorkCol.Index : ColIndex) + (WorkInputAttr ? '*' + WorkInputAttr : ''),
							
							addevent: 'input'}));
						
						break;
						
						case 'checkbox': case 'radio':

							TD.appendChild(new elem('input', {
							
							type: WorkInputType, 
							
							id: WorkId, 
							
							name: WorkOutMark, 
							
							value: WorkValue, 
							
							attr: 'data-out=' + WorkOutMark + '*data-n=' + (WorkCol ? WorkCol.Index : ColIndex) + (WorkInputAttr ? '*' + WorkInputAttr : '') + (PromptEl ? '*data-prompt' : ''),
							
							addevent: 'change'}));
							
						break;
					
					}
					
					if (/text|tel/.test(WorkInputType)) TD.appendChild(new elem('span', {}));
					
					if (WorkInputType == 'radio' || WorkInputType == 'checkbox') TD.appendChild(new elem('label', {classname: WorkInputType + (ComplexLength > 1 ? ' single-string' : ''), textcontent: (Complex ? Complex[ComplexIndex] : ''), attr: 'for=' + WorkId}));
					
					if (WorkInputType == 'text' && /data-progress=line/.test(WorkInputAttr)) TD.appendChild(new elem('div', {classname: 'progress-container', attr: 'data-for=' + WorkId}));
					
					DATACOMPLETED.hasOwnProperty(WorkOutMark) || (DATACOMPLETED[WorkOutMark] = [WorkInputType, [], '']);
					
					if (PromptEl) PTDATA.hasOwnProperty(WorkOutMark) || (PTDATA[WorkOutMark] = {});
					
				}
				
			} else {
				
				PromptEl = WorkRow.Name.match(/^Друг(ое$|ие$|ая$|ой$)|\[(t|n)\]/);
				
				// Подстановка ответа в название строки -------------------------------------------------------------------------
				
				SpecialChar = WorkRow.Name.match(/^.*(?<Replace>\$(?<Var>.+)\$).*/);
				
				if (SpecialChar != null) WorkRow.Name = WorkRow.Name.replaceAll(SpecialChar.groups.Replace, RULESDATA[SpecialChar.groups.Var.replace(/\./g, '_')].ResponseData[0].QResponse);
				
				// --------------------------------------------------------------------------------------------------------------
				
				// Выделение элементов в названии строки ------------------------------------------------------------------------
				
				RowContentHLT = [...WorkRow.Name.matchAll(/(?<Replace>\{(?<Hlt>[^\}]+)\})/g)];
		
				if (RowContentHLT.length > 0) [].forEach.call(RowContentHLT, function(x) {
				
					WorkRow.Name = WorkRow.Name.replace(x.groups.Replace, '<r class="hlt">' + x.groups.Hlt + '</r>');
					
				});
				
				// --------------------------------------------------------------------------------------------------------------
				
				TD.classList.add('row-head');
				
				TD.appendChild(new elem('div', {classname: WorkRow.Class, innerhtml: WorkRow.Name}));

				if (WorkRow.Note) {
					
					// Подстановка ответа в подпись строки ----------------------------------------------------------------------

					SpecialChar = WorkRow.Note.match(/^.*(?<Replace>\$(?<Var>.+)\$).*/);

					TD.appendChild(new elem('div', {classname: 'row-note', textcontent: SpecialChar != null ? WorkRow.Note.replaceAll(SpecialChar.groups.Replace, RULESDATA[SpecialChar.groups.Var.replace(/\./g, '_')].ResponseData[0].QResponse) : WorkRow.Note}));
					
					// ----------------------------------------------------------------------------------------------------------

				}
				
			}
			
			TR.appendChild(TD);
			
		}
		
		if (HasInput) QB.appendChild(TR);
		
	}

	// --------------------------------------------------------------------------------------------------------------------------
	
	if (STATEINDEX == 1) {
		
		document.querySelector('#Back').classList.add('hidden');
		
		document.querySelector('#Submit').textContent = 'Сохранить ответ и перейти к следующему вопросу';

	} else if (STATEINDEX < + PROJECT.Total) {
		
		if (HISTORY && STATEINDEX > 1) document.querySelector('#Back').classList.remove('hidden');
		
		document.querySelector('#Submit').textContent = HasInput ? 'Сохранить ответ и перейти к следующему вопросу' : 'Следующий вопрос';
  
	} else if (STATEINDEX == + PROJECT.Total) {
		
		document.querySelector('#Submit').textContent = 'Завершить';
		
		document.querySelector('#Back').classList.add('hidden');
		
	}

	if (PROJECTLIST[LISTINDEX].Data) for (let i in PROJECTLIST[LISTINDEX].Data) {
		
		let INM = i.replace(/_/g, '.');
		
		let IEL = document.querySelector('[data-out="' + INM + '"]');
		
		if (IEL != null) HistoryDataFill(IEL.type, INM, PROJECTLIST[LISTINDEX].Data[i][0].split(','));
		
	}
	
}

function HistoryDataFill(Type, DataOut, DataValue) {
	
	let DataArray;
	
	let Element;
	
	switch (Type) {
		
		case 'text': case 'number': case 'tel': case 'textarea': document.querySelector('[data-out="' + DataOut + '"]').value = DataValue;
		
		break;
		
		case 'select-one':
		
			Element = document.querySelector('[data-out="' + DataOut + '"]');
			
			if (DataValue[0] != '') {	
			
				DataArray = DataValue[0].match(/(\d+)-?(.+)?/);
		
				Element.selectedIndex = DataArray[1];
				
				if (typeof(DataArray[2]) != 'undefined') {
					
					Element.parentNode.lastChild.value = DataArray[2].replace(/\//g, ',');
						
					Element.parentNode.lastChild.classList.add('-active');
					
				}
				
			}
		
		break;
		
		case 'checkbox':
	                
			if (DataValue[0] != '') {	
			
				[].forEach.call(DataValue, function(x) {
					
					DataArray = x.match(/(?<val>\d+)-?(?<txt>.+)?/);
					
					Element = document.querySelector('[data-out="' + DataOut + '"][value="' + DataArray.groups.val + '"]');
					
					Element.checked = true;
					
					if (typeof(DataArray.groups.txt) != 'undefined') {
						
						Element.parentNode.lastChild.title = DataArray.groups.txt.replace(/\//g, ',');
						
						PTDATA[DataOut][DataArray.groups.val] = DataArray.groups.txt.replace(/\//g, ',');
						
					}
					
				});
				
			}
			
		break;
		
		case 'radio':
	                
			if (DataValue[0] != '') {
				
				DataArray = DataValue[0].match(/(?<val>\d+)-?(?<txt>.+)?/);

				Element = document.querySelector('[data-out="' + DataOut + '"][value="' + DataArray.groups.val + '"]');
				
				Element.checked = true;
				
				if (typeof(DataArray.groups.txt) != 'undefined') {
					
					Element.parentNode.lastChild.title = DataArray.groups.txt.replace(/\//g, ',');
					
					PTDATA[DataOut][DataArray.groups.val] = DataArray.groups.txt.replace(/\//g, ',');
					
				}
			
			}
			
		break;
		
	}
	
}

function progressBar(el) {
	
	let delta = Math.round(100 / (+ el.maxLength / el.value.length));
	
	let bg;
	
	switch (el.dataset.progress) {
		
		case 'B':
		
			bg = typeof(el.dataset.progressBg) != 'undefined' ? el.dataset.progressBg : '00ff4d50';
		
			el.style.background = 'linear-gradient(90deg, ' + bg + ' ' + delta + '%, transparent ' + delta + '%, transparent 100%)';
		
		break;
		
		case 'L':
		
			bg = typeof(el.dataset.progressBg) != 'undefined' ? el.dataset.progressBg : '00ff4d80';
		
			document.querySelector('div[data-for="' + el.id + '"]').style.width = delta + '%';
			
			document.querySelector('div[data-for="' + el.id + '"]').style.backgroundColor = bg;
		
		break;
		
	}
	
}

function listener(e) {
	
	let el = e.target || e;
	
	let A = document.querySelector('table.main-table');
	
	let FD = new FormData();
	
	let pool;
	
	let WorkId;
	
	if (document.querySelector('#WarnMarker') != null) {

		document.querySelector('#WarnMarker').remove();
		
		document.querySelector('#Submit').textContent = 'Сохранить ответ и перейти к следующему вопросу';
		
		document.querySelector('#Submit').classList.remove('-warn');
		
	}
	
	switch (e.type) {
		
		case 'change' :
		
			switch (el.type) {
				
				case 'checkbox':
				
					if (el.id == 'NotInList') {

						if (el.checked) document.querySelector('#NotInListTable').classList.remove('hidden');
						
						else document.querySelector('#NotInListTable').classList.add('hidden');
						
						[].forEach.call(document.querySelectorAll('#AuthInputContainer input'), function(x) {
							
							if (el.checked) x.setAttribute('Disabled', '');
							
							else x.removeAttribute('disabled');
							
						});
						
					} else {
						
						if (el.checked) {

							pool = QDATA.OutMark == '1' ? el.parentNode.parentNode.querySelectorAll('input[type="checkbox"]') : A.querySelectorAll('input[data-n="' + el.dataset.n + '"]');
	
							if (el.hasAttribute('data-only')) {
							
								[].forEach.call(pool, function(x) {
							
									if (x != el) {

										x.checked = false;
										
										if (x.hasAttribute('data-prompt')) {
											
											delete PTDATA[x.dataset.out][x.value];
						
											x.parentNode.querySelector('label').title = '';
											
										}
										
									}
								
								})
								
							} else {
								
								[].forEach.call(pool, function(x) { 
								
									if (x.hasAttribute('data-only')) {

										x.checked = false;
										
										if (x.hasAttribute('data-prompt')) {
											
											delete PTDATA[x.dataset.out][x.value];
						
											x.parentNode.querySelector('label').title = '';
											
										}
										
									}
									
								});
								
							}
	
							if (el.hasAttribute('data-single')) {

								pool = el.dataset.single == 'row' ? el.parentNode.parentNode.querySelectorAll('input[type="checkbox"], input[type="radio"]') : A.querySelectorAll('input[data-n="' + el.dataset.n + '"]');
								
								[].forEach.call(pool, function(x) { x == el || (x.checked = false) });
	
							}
		
							if (el.hasAttribute('data-equal')) {
								
								pool = QDATA.OutMark == '1' ? el.parentNode.parentNode.querySelectorAll('input[type="checkbox"]:checked') : A.querySelectorAll('input[data-n="' + el.dataset.n + '"]:checked');
								
								if (el.dataset.equal < pool.length) {

									let next = false;
									
									let first;
									
									[].forEach.call(pool, function(x, i) {
										
										if (next) {
											
											x.checked = false;
											
											next = false;
											
											if (x.hasAttribute('data-prompt')) {
												
												delete PTDATA[x.dataset.out][x.value];
						
												x.parentNode.querySelector('label').title = '';;
												
											}
											
										}
										
										if (x == el && i < el.dataset.equal) next = true;
										
										else if (i == 0) first = x;
										
										if (x == el && i == el.dataset.equal) first.checked = false;

									});
									
								}

							}
							
							if (el.hasAttribute('data-prompt')) {
								
								al('SinglePrompt').then(function(x) {
									
									if (PROMPTRESULT) {
										
										if (PROMPTRESULT.value.trim() == '') {

											delete PTDATA[el.dataset.out][el.value];
											
											el.parentNode.querySelector('label').title = '';
											
											el.checked = false;
											
										} else {
											
											PTDATA[el.dataset.out][el.value] = PROMPTRESULT.value;
											
											el.parentNode.querySelector('label').title = PROMPTRESULT.value;
											
										}
										
									} else el.checked = false;
									
								}).catch(function(e) {
									
									el.checked = false;
									
									console.log(e);
									
								});
								
							}
		
						} else if (el.hasAttribute('data-prompt')) {
												
							delete PTDATA[el.dataset.out][el.value];
							
							el.parentNode.querySelector('label').title = '';
							
						}
					
					}

				break;
				
				case 'radio':
				
					if (el.hasAttribute('data-single')) [].forEach.call(el.parentNode.parentNode.querySelectorAll('input[type="checkbox"], input[type="radio"]'), function(x) { x == el || (x.checked = false) });
			
					if (el.hasAttribute('data-prompt')) {
						
						if (PTDATA.hasOwnProperty(el.dataset.out)) {
							
							PTDATA[el.dataset.out] = {};
							
							[].forEach.call(A.querySelectorAll('input[name="' + el.dataset.out + '"]+label'), function(x) { x.title = '' });
							
						}
						
						al('SinglePrompt').then(function(x) {
									
							if (PROMPTRESULT) {
								
								if (PROMPTRESULT.value.trim() == '') {

									el.parentNode.querySelector('label').title = '';
									
									el.checked = false;
									
								} else {
									
									PTDATA[el.dataset.out][el.value] = PROMPTRESULT.value;
									
									el.parentNode.querySelector('label').title = PROMPTRESULT.value;
									
								}
								
							} else el.checked = false;
							
						}).catch(function(e) {
							
							el.checked = false;
							
							console.log(e);
							
						});
	
					} else if (PTDATA.hasOwnProperty(el.dataset.out)) {
						
						PTDATA[el.dataset.out] = {};
						
						[].forEach.call(A.querySelectorAll('input[name="' + el.dataset.out + '"]+label'), function(x) { x.title = '' });
						
					}
					
					if (el.hasAttribute('data-single')) {

						pool = el.dataset.single == 'row' ? el.parentNode.parentNode.querySelectorAll('input[type="checkbox"], input[type="radio"]') : A.querySelectorAll('input[data-n="' + el.dataset.n + '"]');
						
						[].forEach.call(pool, function(x) { x == el || (x.checked = false) });
	
					}

				break;
				
				case 'file':
				
					let FileContainer = document.querySelector('#Item' + (+ el.dataset.index + 1) + ' .file-list tbody');
				
					Cleaner(FileContainer);
				
					if (el.files.length) {
						
						[].forEach.call(el.files, function(f) {

							let FTR = new elem('tr', {});
							
							FTR.appendChild(new elem('td', {classname: 'file-item', textcontent: f.name}));
							
							FTR.appendChild(new elem('td', {classname: 'file-item', textcontent: Math.floor(f.size / 1048576) > 0 ? ((f.size / 1048576).toFixed(1) + ' Mb') : ((f.size / 1024).toFixed(1) + ' Kb')}));
							
							FTR.appendChild(new elem('td', {classname: 'top-filler'}));
							
							FileContainer.appendChild(FTR);

						});
					
						document.querySelector('#Item' + (+ el.dataset.index + 1) + ' tr[class*=file-list-container]').classList.remove('hidden');
					
					} else document.querySelector('#Item' + (+ el.dataset.index + 1) + ' tr[class*=file-list-container]').classList.add('hidden');

				break;
				
				case 'select':
				
					if (el.dataset.tmi != null) {
				
						if (el.selectedIndex == el.dataset.tmi) {
							
							el.parentNode.lastChild.classList.add('-active');
							
							el.parentNode.lastChild.focus();
							
						} else {
							
							el.parentNode.lastChild.classList.remove('-active');
							
						}
						
					}
					
				break;
				
			}
		
		break;
		
		case 'input':

			document.querySelector('[class^=e-container]') && (document.querySelector('[class^=e-container]').remove());
		
			switch (el.type) {
				
				case 'number':
				
					if (el.value && ! /^0.+|\D/g.test(el.value)) {
				
						el.hasAttribute('min') && (el.value < + el.min && (el.value = el.value.substr(0, el.value.length - 1)));
						
						el.hasAttribute('max') && (el.value > + el.max && (el.value = el.value.substr(0, el.value.length - 1)));
						
					} else el.value = '';

				break;
				
				case 'text':
				
					el.value = el.value.replace(/[\/\\`~^]/g, '');
				
					el.dataset.maxLength != 'undefined' && (el.value.length > + el.dataset.maxLength && (el.value = el.value.substr(0, el.dataset.maxLength)));
					
					el.dataset.except != 'undefined' && (el.value = el.value.replace(el.dataset.except, ''));
					
					if (el.dataset.progress != 'undefined' && el.dataset.maxLength != 'undefined') progressBar(el);

				break;
				
				case 'tel':
				
					TelInput(el);
				
				break;
			}
		
		break;
		
		case 'blur':
		
			switch (el.type) {
				
				case 'number':
				
					if (el.hasAttribute('data-unique')) {

						pool = QDATA.OutMark == '2' ? el.parentNode.parentNode.querySelectorAll('input[data-unique]') : A.querySelectorAll('input[data-n="' + el.dataset.n + '"][data-unique]');
					    
					    [].forEach.call(pool, function(x) { if (el.id != x.id && el.value == x.value) el.value = ''; });
					    
					}
			
				break;
			
			}
		
		break;
		
		case 'keypress': if (/Enter|NumpadEnter/.test(e.code)) document.querySelector('#Login').click();
		
		break;
		
		case 'dblclick':
		
			if (! el.hasAttribute('data-index')) while ((el = el.parentNode) && ! el.hasAttribute('data-index'));

			if (confirm('Отправить ещё раз?')) SendItem(el.dataset.index);
		
		break;
		
		case 'click':
		
			if (! el.hasAttribute('id')) while ((el = el.parentNode) && ! el.hasAttribute('id'));
			
			WorkId = el.id.replace(/\d/g, '');
		
			switch (WorkId) {
				
				case 'Submit':
				
					if (+ PROJECT.Total > STATEINDEX) {
				
						if (Object.keys(DATACOMPLETED).length) {
						
							let E = false;
							
							let WorkSet;
							
							let NODATA = DATACOMPLETED.hasOwnProperty(null);
							
							for (let i in DATACOMPLETED) DATACOMPLETED[i][1] = [];
							
							if (! NODATA) for (let i in DATACOMPLETED) { // by data-out 
								
								switch (DATACOMPLETED[i][0]) {
									
									case 'checkbox':
								
										WorkSet = A.querySelectorAll('[data-out="' + i + '"]');
										
										let CheckboxError = false;
										
										E = VALID.Check(WorkSet);
										
										if (E && typeof(E[0]) != 'string') {
											
											[].forEach.call(E, function(x) {
												
												if (x.dataset.prompt != null) {
													
													DATACOMPLETED[i][1].push(x.value + '-' + PTDATA[x.dataset.out][x.value].replace(/,/g, '/'));

												} else if (x.dataset.autoFill != null) {
													
													DATACOMPLETED[i][1].push(x.value + '-' + x.parentNode.parentNode.querySelector('.row').textContent);
													
												} else DATACOMPLETED[i][1].push(x.value);
												
											});
											
											E = CheckboxError ? CheckboxError : false;
											
										}

									break;
								
									case 'radio':
								
										WorkSet = A.querySelectorAll('[data-out="' + i + '"]');
										
										let RadioValue = '';
										
										E = VALID.Check(WorkSet);
										
										if (E && typeof(E[0]) != 'string') {
											
											if (typeof(E[0].dataset.prompt) != 'undefined') {
		
												RadioValue = E[0].value + '-' + PTDATA[E[0].dataset.out][E[0].value].replace(/,/g, '/');
		
											} else RadioValue = E[0].value;
											
											if (RadioValue != '') {
												
												DATACOMPLETED[i][1].push(RadioValue + (E[0].dataset.autoFill != null ? ('-' + E[0].parentNode.parentNode.querySelector('.row').textContent) : ''));
												
												E = false;
												
											}
											
										}

									break;
										
										case 'number':
		
										WorkSet = A.querySelector('[data-out="' + i + '"]');
										
										if (! /^$|^0.+$|\D+/g.test(WorkSet.value)) {
											
											E = VALID.Check(WorkSet);
											
											if (! E) DATACOMPLETED[i][1].push(WorkSet.value);
											
										} else if (WorkSet.hasAttribute('disabled') || WorkSet.hasAttribute('data-not-required') || WorkSet.hasAttribute('data-default')) {
											
											if (WorkSet.hasAttribute('data-default')) {
												
												DATACOMPLETED[i][1].push(WorkSet.dataset.default);
												
											} else DATACOMPLETED[i][1].push('');
											
											//if (! E && WorkSet.hasAttribute('data-limit')) E = VALID.Check(WorkSet, 'Limit');
											
											//if (! E && WorkSet.hasAttribute('data-total')) E = VALID.Check(WorkSet, 'Total');
											
										} else E = ['Выделенное поле заполнено некорректно.<br>Необходимо заполнить это поле.', [WorkSet]];
									
									break;
									
									case 'text':
									
										WorkSet = A.querySelector('[data-out="' + i + '"]'); 
										
										E = VALID.Check(WorkSet);
										
										if (! E) DATACOMPLETED[i][1].push(WorkSet.value);
									
									break;
									
									case 'file':
										
										WorkSet = A.querySelector('input[type="file"]');
										
										if (WorkSet.files.length) {
											
											[].forEach.call(WorkSet.files, function(x) { DATACOMPLETED[i][1].push(x.name); });

										} 
										
									break;
									
									case 'tel':
									
										WorkSet = A.querySelector('[data-out="' + i + '"]'); 
								
										if (! /_/.test(WorkSet.value)) {
											
											DATACOMPLETED[i][1].push(WorkSet.value);
											
										} else E = ['Выделенное поле заполнено некорректно.<br>Необходимо правильно заполнить это поле', [WorkSet]];

									break;
									
									case 'textarea':
									
										WorkSet = A.querySelector('[data-out="' + i + '"]');
										
										if (WorkSet.hasAttribute('data-not-required') || WorkSet.value) {
											
											DATACOMPLETED[i][1].push(WorkSet.value);
											
										} else E = ['Выделенное поле заполнено некорректно.<br>Необходимо заполнить это поле.', [WorkSet]];
									
									break;
									
									case 'select':
									
										WorkSet = A.querySelector('[data-out="' + i + '"]');
										
										if (WorkSet.hasAttribute('data-not-required') || WorkSet.selectedIndex > 0) {
											
											if (WorkSet.dataset.tmi != null) {
												
												if (WorkSet.selectedIndex == WorkSet.dataset.tmi) {
													
													let SelectText = WorkSet.parentNode.lastChild;
													
													if (SelectText.value) {
														
														DATACOMPLETED[i][1].push(WorkSet.selectedIndex + '-' + SelectText.value.replace(/,/g, '/'));
														
														DATACOMPLETED[i][2] = WorkSet.querySelector('option:nth-child(' + (WorkSet.selectedIndex + 1) + ')').value;
														
													} else E = ['Выделенное поле заполнено некорректно.<br>Необходимо заполнить это поле.', [WorkSet]];	
													
												} else {
													
													DATACOMPLETED[i][1].push(WorkSet.selectedIndex);
													
													DATACOMPLETED[i][2] = WorkSet.querySelector('option:nth-child(' + (WorkSet.selectedIndex + 1) + ')').value;
													
												}
												
											} else {
												
												DATACOMPLETED[i][1].push(WorkSet.selectedIndex);
												
												DATACOMPLETED[i][2] = WorkSet.querySelector('option:nth-child(' + (WorkSet.selectedIndex + 1) + ')').value;
												
											}
											
										} else E = ['Выделенное поле заполнено некорректно.<br>Необходимо выбрать в этом поле.', [WorkSet]];
									
									break;
									
									case 'NODATA': DATACOMPLETED[i][1].push('');
									
									break;
									
									default: DATACOMPLETED[i][1].push(A.querySelector('[data-out="' + i + '"]').value);
									
									break;
									
								}
								
								if (E) break;
								
							}
							
							if (! E && TRACKER.length) {
							
								WorkSet = [];
								
								[].forEach.call(TRACKER, function(x) { WorkSet.push(document.querySelector('img[data-track-number="' + x + '"')) });
								
								E = ['Необходимо просмотреть все изображения.', WorkSet];
								
							}

							if (E) { // display error
	
								let Top = 0;
								
								let Left = 0;
								
								let Width = 0;
								
								let Height = 0;
								
								let Offset;
								
								[].forEach.call(E[1], function(x, i) {
									
									Offset = getOffset(x.parentNode);

									Left = Left || Offset.Left;
										
									Top = Top || Offset.Top;
										
									if (Offset.Left && Offset.Width) Width = Offset.Left + Offset.Width - Left;
										
									if (Offset.Top && Offset.Height) Height = Offset.Top + Offset.Height - Top;
									
								});
								
								ed = new elem('div', {id: 'WarnMarker', classname: '-warnmarker', addevent: 'click'});
								
								document.querySelector('#MainContainer').append(ed);
								
								ed.style.left = Left + 'px';
								
								ed.style.top = Top - 30 + 'px';//- document.querySelector('#MainContainer').scrollTop + 'px';
								
								ed.style.width = Width + 'px';
								
								ed.style.height = Height + 'px';
								
								document.querySelector('#Submit').classList.add('-warn');
								
								document.querySelector('#Submit').innerHTML = E[0];

							} else { // q save offline --------------------------------------------------------------------------------------------------------------------------
								
								if (! NODATA) for (let i in DATACOMPLETED) PROJECTLIST[LISTINDEX].Data[i] = [DATACOMPLETED[i][1].join(), STATEINDEX];
								
								DATACOMPLETED = {};
								
								let CurrentState = STATEINDEX;
								
								STATEINDEX = RULESDATA.Direct.hasOwnProperty(STATEINDEX) ? GetNextIndex() : STATEINDEX + 1;
								
								if (HISTORY) {
									
									let H = PROJECTLIST[LISTINDEX].History;
									
									if (STATEINDEX - CurrentState > 1) {
										
										let CleanArray = [];
										
										for (let i = CurrentState + 1; i < STATEINDEX; i ++) {
											
											let CleanIndex = H.indexOf(i);
											
											if (CleanIndex != -1) {
												
												H.splice(CleanIndex, 1);
												
												CleanArray.push(i);
												
											}
											
										}
										
										let CleanNames = [];
										
										for (let i in PROJECTLIST[LISTINDEX].Data) {
											
											if (PROJECTLIST[LISTINDEX].Data[i][1] == STATEINDEX) HISTORYDATA[i] = PROJECTLIST[LISTINDEX].Data[i][0];
											
											if (CleanArray.length) if (CleanArray.includes(PROJECTLIST[LISTINDEX].Data[i][1])) CleanNames.push(i);
											
										}
										
										if (CleanNames.length) for (let i in CleanNames) delete PROJECTLIST[LISTINDEX].Data[CleanNames[i]];
										
									}
									
									let CurrentIndex = H.indexOf(CurrentState);
									
									if (CurrentIndex == -1) {
										
										if (H.length && H[H.length - 1] > CurrentState) {
											
											let I;
											
											for (I in H) if (H[I] > CurrentState) break;
											
											H.splice(+ I, 0, CurrentState);
											
										} else H.push(CurrentState);
										
									}
									
									PROJECTLIST[LISTINDEX].History = H;
									
								}
								
								PROJECTLIST[LISTINDEX].StateIndex = STATEINDEX;
								
								DB.transaction('Items', 'readwrite').objectStore('Items').put({Id: PROJECT.id + ':' + LISTINDEX, ProjectId: PROJECT.id, Data: PROJECTLIST[LISTINDEX]});
	
								PageManager.Page('MainContainer', true);
								
								if (RULESDATA.hasOwnProperty('Visual') && RULESDATA.Visual.hasOwnProperty(STATEINDEX)) VisualRuleProcessing();

							}
						
						}
						
					} else {

						PROJECTLIST[LISTINDEX].Status = ABORTED ? 3 : 2;
						
						PROJECTLIST[LISTINDEX].StateIndex = STATEINDEX;
						
						DB.transaction('Items', 'readwrite').objectStore('Items').put({Id: PROJECT.id + ':' + LISTINDEX, ProjectId: PROJECT.id, Data: PROJECTLIST[LISTINDEX]});
						
						document.querySelector('#Abort').click();
						
					}

				break;
				
				case 'NewItem':
				
					Action.Get('New');
				
				break;

				case 'Abort':
				
					STATEINDEX = 1;
				
					DATACOMPLETED = {};
					
					if (RECORD && RECORDPERMISSION && RECORDER.state == 'recording') {
						
						RECORDTIME += GetDate(true);
		        
						RECORDER.stop();
						
						clearInterval(TIMERCALL);
						
					}
				
					if (PROJECTLIST.length) Cleaner(document.querySelector('#HomePage #ListContainer'));

					PageManager.Page('HomePage', true);

				break;
				
				case 'Login':

					if (CANSEND) {

						let AuthError = false;
						
						[].forEach.call(document.querySelectorAll('.login-input'), function(x, i) { 
						
							if (! x.value.trim() || x.value == '+7(___)___-__-__') AuthError = true;
							
							else FD.append(x.id, x.value.trim());
							
						});

						if (AuthError === false) {
							
							let ProjectId = document.querySelector('#ProjectId').value.trim();
							
							PROJECT = storage('PROJECT' + ProjectId);
							
							PROJECT = PROJECT ? JSON.parse(PROJECT) : false;
							
							if (! PROJECT) {
								
								el.classList.add('preloader');
							
								SendRequest('Public/Php/GetProject.php', FD);
								
							} else if (md5(document.querySelector('#ProjectPassword').value.trim()) == PROJECT.Hash) {
								
								LOGDATA = [document.querySelector('#LogData1').value, document.querySelector('#LogData2').value];
								
								storage('LOGDATA', JSON.stringify(LOGDATA));
								
								HISTORY = PROJECT.History == 'ON' ? true : false;
							
								QND = PROJECT.QNHidden == 'ON' ? false : true;;
								
								DB.transaction('Projects').objectStore('Projects').index('ProjectId').get(ProjectId).onsuccess = function(e) {
		
									if (e.target.result) PROJECTDATA = e.target.result.Data;
								
								}
								
								DB.transaction('Rules').objectStore('Rules').index('ProjectId').get(ProjectId).onsuccess = function(e) {
									
									if (e.target.result) RULESDATA = e.target.result.Data;
								
								}
								
								DB.transaction('Items').objectStore('Items').index('ProjectId').getAll(ProjectId).onsuccess = function(e) {
									
									if (e.target.result.length) {
										
										[].forEach.call(e.target.result, function(x) { PROJECTLIST.push(x.Data) });
										
										LISTINDEX = PROJECTLIST.length;
										
									}
									
									RECORD = /\[RECORD\]/.test(PROJECT.Version);
									
									if (RECORD) getRecordPerm();
									
									PageManager.Page('HomePage');
								
								}
								
							} else al('LoginError');
							
						} else al('authError');
						
					}
					
				break;

				case 'Resume': case 'Item':
				
					if (! el.hasAttribute('data-index')) while ((el = el.parentNode) && ! el.hasAttribute('data-index')); 
				
					Action.Get('Current', el.dataset.index);
				
				break;
			    
				case 'Back':
				
					ABORTED = false;
				
					DATACOMPLETED = {};
					
					let IndexInHistory = PROJECTLIST[LISTINDEX].History.indexOf(STATEINDEX);
					
					STATEINDEX = IndexInHistory == -1 ? PROJECTLIST[LISTINDEX].History[PROJECTLIST[LISTINDEX].History.length - 1] : PROJECTLIST[LISTINDEX].History[IndexInHistory - 1];
					
					PageManager.Page('MainContainer', true);

				break;
				
				case 'SendItem':
				
					if (! el.hasAttribute('data-index')) while ((el = el.parentNode) && ! el.hasAttribute('data-index'));
					
					SendItem(el.dataset.index);

				break;
				
				case 'SelectFiles':
				
					let File = document.querySelector('#File');
					
					File.setAttribute('data-index', el.dataset.index);
					
					File.click();
				
				break;
				
				case 'SendFiles':
				
					if (CANSEND) {
						
						SENDINDEX = + el.dataset.index + 1;
						
						FD.append('ProjectId', PROJECT.id);
						
						FD.append('LogData', JSON.stringify(LOGDATA));
						
						FD.append('Index', el.dataset.index);
				
						[].forEach.call(document.querySelector('#File').files, function(f) { FD.append('file[]', f); });
						
						SENDFILES = true;
						
						SendRequest('Public/Php/Upload.php', FD);
						
					}
				
				break;

			}
		
		break;
		
	}
	
}

function SendItem(i) {
	
	if (CANSEND) {
						
		let SendFD = new FormData();

		SENDINDEX = + i + 1;
		
		SendFD.append('ProjectId', PROJECT.id);
		
		SendFD.append('LogData', JSON.stringify(LOGDATA));
		
		SendFD.append('Index', i);

		SendFD.append('Data', JSON.stringify(PROJECTLIST[i].Data));
		
		let SendButton = document.querySelector('.item-container[data-index="' + i + '"] #SendItem');
		
		if (RECORD && ! PROJECTLIST[i].NeedRecord) {
			
			DB.transaction('Media').objectStore('Media').index('Id').get(PROJECT.id + ':' + i).onsuccess = function(e) {
			
				if (e.target.result) SendFD.append('Media', JSON.stringify(e.target.result.Data));
				
				SendButton.classList.add('preloader');
		
				SendRequest('Public/Php/Write.php', SendFD);
				
			}
			
		} else {
		
			SendButton.classList.add('preloader');
		
			SendRequest('Public/Php/Write.php', SendFD);
			
		}
		
	}
	
}

let Action = {
	
	New: function(index, CanRecord) {
		
		ITEM = new Item();
		
		MEDIA = new Media();
		
		if (RECORD && ! RECORDPERMISSION) ITEM.NeedRecord = true;
		
		PROJECTLIST.push(ITEM);
		
		LISTINDEX = PROJECTLIST.length - 1;

		DB.transaction('Items', 'readwrite').objectStore('Items').put({Id: PROJECT.id + ':' + LISTINDEX, ProjectId: PROJECT.id, Data: ITEM});
		
		PageManager.Page('MainContainer');
		
	},
	
	Current: function(index) {
		
		LISTINDEX = index;
					
		STATEINDEX = PROJECTLIST[LISTINDEX].StateIndex;
		
		if (! PROJECTLIST[LISTINDEX].NeedRecord && RECORDPERMISSION) {
		
			DB.transaction('Media').objectStore('Media').index('Id').get(PROJECT.id + ':' + LISTINDEX).onsuccess = function(e) {
				
				if (e.target.result) MEDIA = e.target.result.Data;
				
				PageManager.Page('MainContainer');

				if (RULESDATA.hasOwnProperty('Visual') && RULESDATA.Visual.hasOwnProperty(STATEINDEX)) VisualRuleProcessing();
				
			}
		
		} else {
			
			document.querySelector('.top-record').classList.add('hidden');
					
			document.querySelector('.top-timer').classList.add('hidden');
			
			PageManager.Page('MainContainer');

			if (RULESDATA.hasOwnProperty('Visual') && RULESDATA.Visual.hasOwnProperty(STATEINDEX)) VisualRuleProcessing();
			
		}

	},
	
	Get: function(type, index = false) {
		
		if (RECORD && RECORDPERMISSION) {
		
			RECORDTIME = GetDate(true, true);
					
			RECORDER.start();
			
			TIMERCALL = window.setInterval(RecordTimer, 1000);
			
			document.querySelector('.top-record').classList.remove('hidden');
			
			document.querySelector('.top-timer').classList.remove('hidden');
			
		}
		
		let Result = this[type](index);
		
		return Result;
		
	}
	
}

function GetNextIndex() {
	
	let R = RULESDATA.Direct[STATEINDEX];
	
	let COMMON_RESULT = false;
	
	let DATA = PROJECTLIST[LISTINDEX].Data;
	
	let I;
	
	for (I = 0; I < R.Action.length; I ++) {
		
		let OVERALL_RESULT = false;

		let INTERIM_RESULT = false;
		
		let TRIGGER_VALUE = false;
		
		let TriggerVar = R.TriggerVar[I].replace('.', '_').split(',');
		
		let Target = R.Target[I].split(',');
		
		let Operation = R.Operation[I].split(',');
		
		for (let TVK = 0, TVV; TVK < TriggerVar.length; TVK ++) {
			
			TVV = TriggerVar[TVK];
			
			let TargetMatch = Target[TVK].match(/\$([^&]+)&([^,]+)/);
			
			if (TargetMatch != null) {
				
				let TargetPool = TargetMatch[1].replace('.', '_').split(';');
				
				let UQData = [];
				
				let SingleData = {};
				
				[].forEach.call(TargetPool, function(TPV, TPK) { UQData.push({'QName': TPV, 'QResponse': DATA[TPV][0], 'QSI': STATEINDEX}); });
					
				[].forEach.call(UQData, function(UQV, UQK) {
					
					if (UQK > 0) {
				
						SingleData['QName'] = SingleData['QName'] + ',' + UQV['QName'];
						
						SingleData['QResponse'] = SingleData['QResponse'] + ',' + UQV['QResponse'];
					
					} else SingleData = UQV;
					
				});
				
				switch (TargetMatch[2]) {
				
					case 'VOL': Target[TVK] = SingleData['QResponse'].split(',').length;
					
					break;
					
				}
				
			}
			
			let matches = TVV.match(/(\w+)\$?(\$\w+)/);
			
			if (matches != null) {
				
				let trgv = matches[1];
				
				switch (matches[2]) {
				
					case '$E': TRIGGER_VALUE = DATA[trgv][0];
					
					break;
					
				}
				
			} else TRIGGER_VALUE = DATA[TVV][0].replace(/-.*/, '');
			
			if (TRIGGER_VALUE == '') TRIGGER_VALUE = 0;
			
			let OperationName = typeof(Operation[TVK]) != 'undefined' ? Operation[TVK] : Operation[0];
			
			switch (OperationName) {
			
				case 'EQUAL': INTERIM_RESULT = TRIGGER_VALUE == Target[TVK] ? true : false;
				
				break;
				
				case 'NOT EQUAL': INTERIM_RESULT = TRIGGER_VALUE != Target[TVK] ? true : false;
				
				break;
				
				case 'CONTAINS': INTERIM_RESULT = TRIGGER_VALUE.split(',').includes(Target[TVK]) ? true: false;	

				break;
				
				case 'NOT CONTAINS': INTERIM_RESULT = ! TRIGGER_VALUE.split(',').includes(Target[TVK]) ? true: false;	

				break;
				
				case 'LESS': INTERIM_RESULT = TRIGGER_VALUE < Target[TVK] ? true : false;
				
				break;
				
				case 'NOT LESS': INTERIM_RESULT = TRIGGER_VALUE >= Target[TVK] ? true : false;
				
				break;
				
				case 'MORE': INTERIM_RESULT = TRIGGER_VALUE > Target[TVK] ? true : false;
				
				break;
				
				case 'NOT MORE': INTERIM_RESULT = TRIGGER_VALUE <= Target[TVK] ? true : false;
				
				break;
				
				case 'VOL': INTERIM_RESULT = Target[TVK] == TRIGGER_VALUE.split(',').length ? true: false;
				
				break;
				
				case 'EXIST': INTERIM_RESULT = TRIGGER_VALUE != '' ? true: false;
				
				break;
				
				case 'NOT EXIST': INTERIM_RESULT = TRIGGER_VALUE == '' ? true: false;
				
				break;
				
				case 'BETWEEN':
				
					let Parts = Target[TVK].split('-');
					
					INTERIM_RESULT = (TRIGGER_VALUE >= Parts[0] && TRIGGER_VALUE <= Parts[1]) ? true : false;
				
				break;
				
			}
			
			OVERALL_RESULT = INTERIM_RESULT ? true : false;
		
			INTERIM_RESULT = false;
			
			if (R.Criterion[I] == 'AND') {
				
				if (! OVERALL_RESULT) break;
				
			} else if (OVERALL_RESULT) break;
			
		}
		
		COMMON_RESULT = OVERALL_RESULT ? true : false;
	
		OVERALL_RESULT = false;
		
		if (R.Compare == 'AND') {
				
			if (! COMMON_RESULT) break;
			
		} else if (COMMON_RESULT) break;
		
	}
	
	ABORTED = (COMMON_RESULT && R.Compare != 'FORK' && R.Transit == 'FINISH') || (! COMMON_RESULT && R.AltTransit == 'FINISH') ? true : false;
	
	return COMMON_RESULT ? (R.Compare == 'FORK' ? (R.Transit.split(',')[I] == 'FINISH' ? PROJECT.Total : + R.Transit.split(',')[I]) : (R.Transit == 'FINISH' ? PROJECT.Total : + R.Transit)) : (R.AltTransit != null ? (R.AltTransit == 'FINISH' ? PROJECT.Total : + R.AltTransit) : STATEINDEX + 1);
	
}

function storage() {

	if ('localStorage' in window && window['localStorage'] !== null) {
		
		if (arguments.length > 1) {
		
			localStorage[arguments[0]] = arguments[1];
			
		} else return localStorage[arguments[0]];
		
	}

}

function GetProgress(x) {
	
	if (PROJECT.Total <= x) return '';
    
    switch (PROJECT.Progress) {
        
        case 'N': return x + '/' + (PROJECT.Total - 1);
        
        break;
        
        case 'P': return Math.round(100 / ((PROJECT.Total - 1) / x)) + '%'; 

        break;
        
    }
    
}