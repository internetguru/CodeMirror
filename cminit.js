(function(win){

  var Config = {};
  Config.help = "?";
  Config.helpTitle = "Keyboard Shortcuts";
  Config.helpHref = "https://dokumenty.internetguru.cz/zkratky";
  Config.appDisable = "×";
  Config.appDisableTitle = "Deactivate CodeMirror (F4)";
  Config.appEnable = "Activate CodeMirror";
  Config.appEnableTitle = "F4";
  Config.format = "Beautify";
  Config.formatTitle = "Ctrl+Shift+B";
  Config.fullscreenDisable = "▫";
  Config.fullscreenDisableTitle = "Disable Fullscreen (Shift+F11)";
  Config.fullscreenEnable = "□";
  Config.fullScreenEnableTitle = "Maximalize (Shift+F11)";
  Config.find = "Find";
  Config.findTitle = "Ctrl+F";
  Config.replace = "Replace";
  Config.replaceTitle = "Ctrl+H";
  Config.appName = "CodeMirror";

  var SyntaxCodeMirror = function() {
    // private
    var
    cm = null,
    scm = null,
    textarea = null,
    fullScreenButton = null,
    visible = true,
    active = true,
    activateUl = null,
    appendButton = function(text, ul, href) {
      var li = document.createElement("li");
      ul.appendChild(li);
      var b;
      if(typeof href == "undefined") {
        b = document.createElement("button");
      } else {
        b = document.createElement("a");
        b.href = href;
      }
      li.appendChild(b);
      b.type = "button";
      b.textContent = text;
      return b;
    },
    toggleApp = function() {
      if(cm.getOption("fullScreen")) toggleFullScreen(cm);
      if(active) {
        cm.toTextArea();
        activateUl.style.display = "";
        textarea.focus();
      } else {
        _init();
        activateUl.style.display = "none";
        cm.focus();
      }
      active = !active;
    },
    autoFormatSelection = function(c) {
      var range = c.execCommand("getSelectedRange");
      c.autoFormatRange(range.from, range.to);
    },
    autoIndentSelection = function(c) {
      var range = c.execCommand("getSelectedRange");
      c.autoIndentRange(range.from, range.to);
    },
    toggleFullScreen = function(c, off) {
      if(typeof off === "undefined") off = false;
      if(!active) return;
      if(c.getOption("fullScreen") || off) {
        c.setOption("fullScreen", false);
        fullScreenButton.textContent = Config.fullscreenEnable;
        fullScreenButton.title = Config.fullScreenEnableTitle;
      } else {
        c.setOption("fullScreen", true);
        fullScreenButton.textContent = Config.fullscreenDisable;
        fullScreenButton.title = Config.fullscreenDisableTitle;
      }
    },
    scrollWin = function(step) {
      var doc = document.documentElement;
      var top = (win.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
      var height = document.body.scrollHeight;
      var scrollTo = top + step;
      if(scrollTo < 0 || scrollTo > height ) return;
      win.scrollTo(0, scrollTo);
    },
    fireEvents = function() {
      win.onkeydown = function(e) {
        var key;
        var isShift;
        if (win.event) {
          key = win.event.keyCode;
          isShift = !!win.event.shiftKey; // typecast to boolean
          isCtrl = !!win.event.ctrlKey; // typecast to boolean
        } else {
          key = e.which;
          isShift = !!e.shiftKey;
          isCtrl = !!e.ctrlKey;
        }
        switch (key) {
          // F4
          case 115:
          if (textarea.closest("form.hideable-hide")) {
            break;
          }
          toggleApp(cm);
          break;
          // Shift + F11
          case 122:
          if(isShift) {
            if (textarea.closest("form.hideable-hide")) {
              break;
            }
            toggleFullScreen(cm);
            cm.focus();
            break;
          }
          // Tab, Shift+Tab
          case 9:
          toggleFullScreen(cm, true);
          default: return true;
        }
        return false;
      }
    },
    initEditor = function() {
      cm = CodeMirror.fromTextArea(textarea, {
        tabMode: "default",
        keyMap:"sublime",
        theme:"tomorrow-night-eighties",
        lineNumbers: true,
        mode: textarea.classList.item(1),
        width:"100%",
        lineWrapping: true,
        matchTags: { bothTags: true },
        //tabSize: 2,
        styleActiveLine: true,
        styleSelectedText: true,
        autoCloseTags: {
          whenClosing: true,
          whenOpening: false
        },
        extraKeys: CodeMirror.normalizeKeyMap({
          "Tab": false,
          "Shift-Tab": false,
          "Ctrl-Shift-R": false,
          "Ctrl-Up": function(c) {
            if(c.getOption("fullScreen"))
              c.execCommand("scrollLineUp");
            else scrollWin(-32);
          },
          "Ctrl-Down": function(c) {
            if(c.getOption("fullScreen"))
              c.execCommand("scrollLineDown");
            else scrollWin(32);
          },
          "Ctrl--": "toggleComment",
          "Ctrl-G": "jumpToLine",
          "Ctrl-E": "deleteLine",
          "End": "goLineRight",
          "Home": "goLineLeftSmart",
          "Ctrl-Shift-H": "replaceAll",
          "Ctrl-Shift-B": function(c) { autoFormatSelection(c); },
          "Ctrl-Shift-I": function(c) { autoIndentSelection(c); },
          "F3": function(c) { c.execCommand("findNext"); },
          "Shift-F3": function(c) { c.execCommand("findPrev"); },
        })
      });
    },
    initActivateButton = function() {
      activateUl = document.createElement("ul");
      var activateButton = appendButton(Config.appEnable, activateUl);
      activateButton.title = Config.appEnableTitle;
      textarea.parentNode.insertBefore(activateUl, textarea);
      activateUl.style.display = "none";
      activateButton.addEventListener("click", toggleApp, false);
    },
    initUserMenu = function() {
      var ul = document.createElement("ul");
      ul.className="codemirror-user-controll";

      var findButton = appendButton(Config.find, ul);
      findButton.title = Config.findTitle;
      var replaceButton = appendButton(Config.replace, ul);
      replaceButton.title = Config.replaceTitle;
      var formatButton = appendButton(Config.format, ul);
      formatButton.title = Config.formatTitle;
      var helpButton = appendButton(Config.help, ul, Config.helpHref);
      helpButton.title = Config.helpTitle;
      fullScreenButton = appendButton(Config.fullscreenEnable, ul);
      fullScreenButton.title = Config.fullScreenEnableTitle;
      var disableButton = appendButton(Config.appDisable, ul);
      disableButton.title = Config.appDisableTitle;
      textarea.nextSibling.insertBefore(ul, textarea.nextSibling.firstChild);

      findButton.onclick = function() {
        CodeMirror.commands.find(cm);
      }
      replaceButton.onclick = function() {
        CodeMirror.commands.replace(cm);
      }
      fullScreenButton.onclick = function() {
        toggleFullScreen(cm);
      }
      formatButton.onclick = function() {
        autoFormatSelection(cm);
      }
      disableButton.onclick = function() {
        toggleApp(cm);
      }
    },
    _init = function() {
      initEditor();
      initUserMenu();
    }
    // public
    return {
      init : function(newTextarea, newScm) {
        // initCfg(cfg);
        scm = newScm;
        textarea = newTextarea;
        _init();
        initActivateButton();
        fireEvents();
      },
      getInstance : function() {
        return cm;
      }
    }
  };

  var textareas = document.querySelectorAll('textarea.codemirror');
  var cm = new SyntaxCodeMirror();
  cm.init(textareas[0], cm);
  win.CodeMirrorInstance = cm.getInstance();

})(window);
