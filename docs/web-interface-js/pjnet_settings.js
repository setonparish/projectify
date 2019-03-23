var CGI_URL = './pjctrl?';

var PCCMD_DATALEN_IDX = 3;
var PCCMD_HEADERLEN = 5;


var lan_interface;
var id_opt_wired_prof1;
var id_opt_wired_prof2;
var id_opt_wired_dis;

function initPjNetSetting() {
  top.setRefresh(false);


  id_opt_wired_prof1 = top.consoleN.document.getElementById('opt_wired_prof1');
  id_opt_wired_prof2 = top.consoleN.document.getElementById('opt_wired_prof2');
  id_opt_wired_dis = top.consoleN.document.getElementById('opt_wired_dis');

  getSettingTab();
  top.power.setFrmPwrLinkFlg(true);
  document.body.style.cursor = 'auto';
  top.power.document.body.style.cursor = 'auto';
  addEvent();
}

function addEvent() {

  $('[name=lan_interface]').on('change', function () {
    lan_interface = $(this).val();
  });

}

function callCGI(op, sub, type, value, okCb, ngCb) {
  var req = top.makeCgiParamReq(op, sub, type, value);
  var myUrl = CGI_URL + req;

  $.ajax({
    type: 'POST',
    url: myUrl,
    dataType: 'json',
    success: function (data) {
      if (okCb) {
        okCb(data);
      }
    },
    error: function (XMLHttpRequest, textStatus, errorThrown) {
      if (ngCb) {
        ngCb(XMLHttpRequest, textStatus, errorThrown);
      }
    }
  });
}

function checkAckCb(ackCb, nackCb) {
  return function (data) {
    if (data[0] == 0x01) {
      if (ackCb) {
        ackCb(data);
      }
    }
    else if (data[0] == 0x02) {
      if (nackCb) {
        nackCb(data);
      }
    }
  }
}

function replaceUrlCb(url) {
  return function () {
    top.dummy.location.replace(url);
  };
}

function setRadioButton(selector, value) {
  var radio = $(selector);
  if (value >= radio.length) {
    value = 0;
  }
  radio.eq(value).prop('checked', true);
  return value;
}

function checkAndSetCb(opc, profile, okCb) {
  return function (data) {
    if (data[0] == 0x01) {
      callCGI(opc, profile, SET_VALUE, data[1], okCb, replaceUrlCb(CGI_URL + "Z"));
    }
    else if (data[0] == 0x02) {
      replaceUrlCb(CGI_URL + "Z");
    }
  }
}

function getAndSetCGI(opc, profile, okCb) {
  callCGI(opc, profile, GET_VALUE, null, checkAndSetCb(opc, profile, okCb), replaceUrlCb(CGI_URL + "Z"));
}

function getLanInterface() {
  if (top.chkPageTopLanInterface()) {
    lan_interface = top.getPageTopLanInterface();
    lan_interface = setRadioButton('[name=lan_interface]', lan_interface);
    top.setPageTopLanInterface(lan_interface);
    getProfileReq2();
  }
  else {
    callCGI(
      OPC_LAN_INTERFACE_CGI,
      0,
      GET_VALUE,
      null,
      checkAckCb(
        getLanInterfaceCb,
        replaceUrlCb(CGI_URL + "Z")
      ),
      null
    );
  }
}

function getLanInterfaceCb(data) {
  lan_interface = data[1];
  lan_interface = setRadioButton('[name=lan_interface]', lan_interface);
  top.setPageTopLanInterface(lan_interface);
}


function getPjActMode() {

  id_lanport = top.consoleN.document.getElementById('lanport');


  ActMode = execPjActMode();
  if (ActMode == 0 || ActMode == 1) {
    id_lanport.style.display = "none";
  }
  else {
    id_lanport.style.display = "block";
  }
}

function execPjActMode() {
  var myUrl = CGI_URL + "D=%PjActMode";
  var ActMode = 0;

  $.ajax({
    type: 'POST',
    url: myUrl,
    dataType: 'json',
    success: function (data) {
      ActMode = data[0];
    },
    error: function (XMLHttpRequest, textStatus, errorThrown) {


    }
  });
  return ActMode;
}



function ResponseParser(data, cmdidx, cmdlen, reqcnt) {
  var i = 0;
  var len = 0;
  while (true) {
    if (i >= reqcnt) {
      break;
    }

    len = (((data[PCCMD_DATALEN_IDX + len] & 0x0F) << 8) | (data[PCCMD_DATALEN_IDX + len + 1]))
    len = len + PCCMD_HEADERLEN + 1;
    cmdlen[i] = len;
    if (i != 0) {
      cmdidx[i] = cmdlen[i - 1] + cmdidx[i - 1];
      len = cmdlen[i] + cmdidx[i];
    } else {
      cmdidx[i] = 0;
    }
    i++;
  }
}


function makeCgiParamReq(req1, req2) {
  if (req1 != '') {
    req1 = req1 + "," + req2;
  } else {
    req1 = req2;
  }
  return req1;
}


function getSettingTab() {
  getLanInterface();
  getProfileReq2();

}


function getProfileReq2() {
  var req = '';
  var reqcnt = 0;

  if (top.chkPageTopWd() == true) {
    if (top.getPageTopWd() == 0) {

      id_opt_wired_prof1.checked = true;
      id_opt_wired_prof2.checked = false;
      id_opt_wired_dis.checked = false;
    } else if (top.getPageTopWd() == 1) {
      id_opt_wired_prof1.checked = false;
      id_opt_wired_prof2.checked = true;
      id_opt_wired_dis.checked = false;

    } else {

      id_opt_wired_prof1.checked = false;
      id_opt_wired_prof2.checked = false;
      id_opt_wired_dis.checked = true;
    }

  } else {

    req = top.makeCgiParamReq(OPC_LAN_PROFILE_CGI, 0, GET_VALUE, null);

    reqcnt++;
    if (req == '') {
      return;
    }

    var myUrl = CGI_URL + req;

    $.ajax({
      type: 'POST',
      url: myUrl,
      dataType: 'json',
      success: function (data) {
        var cmdidx = new Array();
        var cmdlen = new Array();
        ResponseParser(data, cmdidx, cmdlen, reqcnt);
        var i = 0;
        getWiredLanProfCb(data, cmdidx[i]);
        i++;
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {

        var dummyURL = CGI_URL + 'Z';
        top.dummy.location.replace(dummyURL);
      }
    });
  }
}


function getWiredLanProf() {
  if (top.chkPageTopWd() == true) {
    if (top.getPageTopWd() == 0) {

      id_opt_wired_prof1.checked = true;
      id_opt_wired_prof2.checked = false;
      id_opt_wired_dis.checked = false;
    } else {

      id_opt_wired_prof1.checked = false;
      id_opt_wired_prof2.checked = false;
      id_opt_wired_dis.checked = true;
    }
    return;
  }

  var req;
  req = top.makeCgiParamReq(OPC_LAN_PROFILE_CGI, 0, GET_VALUE, null);

  var myUrl = CGI_URL + req;

  $.ajax({
    type: 'POST',
    url: myUrl,
    dataType: 'json',
    success: function (data) {
      getWiredLanProfCb(data, 0);
    },
    error: function (XMLHttpRequest, textStatus, errorThrown) {

      var dummyURL = CGI_URL + 'Z';
      top.dummy.location.replace(dummyURL);
    }
  });
}
function getWiredLanProfCb(data, idx) {

  if ((data[0]) == 0x01) {
    switch (data[1]) {
      case 0x00:

        id_opt_wired_prof1.checked = true;
        id_opt_wired_prof2.checked = false;
        id_opt_wired_dis.checked = false;
        break;
      case 0x01:
        id_opt_wired_prof1.checked = false;
        id_opt_wired_prof2.checked = true;
        id_opt_wired_dis.checked = false;
        break;
      case 0xFE:
        id_opt_wired_prof1.checked = false;
        id_opt_wired_prof2.checked = false;
        id_opt_wired_dis.checked = true;
        break;
      default:
        id_opt_wired_prof1.checked = false;
        id_opt_wired_prof2.checked = false;
        id_opt_wired_dis.checked = true;
        break;
    }
    top.setPageTopWd(data[1]);
  }
}



function setWiredLanProf() {
  top.AllReset();

  var profile;

  $(':input').prop('disabled', true);

  callCGI(OPC_LAN_INTERFACE_CGI, 0, SET_VALUE, lan_interface, getLanInterface, replaceUrlCb(CGI_URL + "Z"));
  top.setPageTopLanInterface(lan_interface);

  if (id_opt_wired_prof1.checked == true) {

    profile = 0x00;
  } else if (id_opt_wired_prof2.checked == true) {

    profile = 0x01;
  } else {

    profile = 0xfe;
    callCGI(OPC_LAN_PROFILE_CGI, 0, SET_VALUE, profile, setLanReset, replaceUrlCb(CGI_URL + "Z"));
    return;
  }

  callCGI(OPC_LAN_PROFILE_CGI, 0, SET_VALUE, profile, null, replaceUrlCb(CGI_URL + "Z"));

  getAndSetCGI(OPC_LAN_DHCP_PROF_CGI, profile, function () { });
  getAndSetCGI(OPC_LAN_IP_PROF_CGI, profile, function () { });
  getAndSetCGI(OPC_LAN_SNMASK_PROF_CGI, profile, function () { });
  getAndSetCGI(OPC_LAN_GATEWAY_PROF_CGI, profile, function () { });
  getAndSetCGI(OPC_LAN_AUTO_GET_DNS_PROF_CGI, profile, function () { });
  getAndSetCGI(OPC_LAN_DNS_PROF_CGI, profile, setLanReset);
}


function setLanReset() {


  req = top.makeCgiParamReq(OPC_LAN_RESET_CGI, 0, SET_VALUE, 0);

  var myUrl = CGI_URL + req;

  $.ajax({
    type: 'POST',
    url: myUrl,
    dataType: 'json',
    success: function (data) {

    },
    error: function (XMLHttpRequest, textStatus, errorThrown) {

      var dummyURL = CGI_URL + 'Z';
      top.dummy.location.replace(dummyURL);
    }
  });

  LanReload();
}

var Timer = 5000;
function LanReload() {
  alert("The settings have been changed. Reload will begin.\nIf reload fails, check the network settings on your computer.");

  setTimeout(PageReload, Timer);
}

function PageReload() {
  window.open("index.html", '_top');
}


function clkSetting(set) {

  var url = "";



  if (set == "wired_prof1") {

    url += "lan_wired_profile.html";
  } else if (set == "wired_prof2") {

    url += "lan_wired_profile2.html";
  }


  window.open(url, '_self');
}

function clkRadioButton(set) {
  var data;
  if (set == "wired") {
    if (id_opt_wired_prof1.checked == true) {
      data = 0;
    } else if (id_opt_wired_prof2.checked == true) {
      data = 1;
    } else {
      data = 2;
    }
    top.setPageTopWd(data);
  }
}

