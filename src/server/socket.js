(function (f) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = f();
  } else if (typeof define === 'function' && define.amd) {
    define([], f);
  } else {
    let g;
    if (typeof window !== 'undefined') {
      g = window;
    } else if (typeof global !== 'undefined') {
      g = global;
    } else if (typeof self !== 'undefined') {
      g = self;
    } else {
      g = this;
    }
    g.io = f();
  }
})(() => {
  let define;
  let module;
  let exports;
  return (function e(t, n, r) {
    function s(o, u) {
      if (!n[o]) {
        if (!t[o]) {
          const a = typeof require === 'function' && require;
          if (!u && a) return a(o, !0);
          if (i) return i(o, !0);
          const f = new Error(`Cannot find module '${o}'`);
          throw ((f.code = 'MODULE_NOT_FOUND'), f);
        }
        const l = (n[o] = { exports: {} });
        t[o][0].call(
          l.exports,
          (e) => {
            const n = t[o][1][e];
            return s(n || e);
          },
          l,
          l.exports,
          e,
          t,
          n,
          r,
        );
      }
      return n[o].exports;
    }
    var i = typeof require === 'function' && require;
    for (let o = 0; o < r.length; o++) s(r[o]);
    return s;
  })(
    {
      1: [
        function (_dereq_, module, exports) {
          module.exports = _dereq_('./lib/');
        },
        { './lib/': 2 },
      ],
      2: [
        function (_dereq_, module, exports) {
          module.exports = _dereq_('./socket');
          module.exports.parser = _dereq_('engine.io-parser');
        },
        { './socket': 3, 'engine.io-parser': 19 },
      ],
      3: [
        function (_dereq_, module, exports) {
          (function (global) {
            const transports = _dereq_('./transports');
            const Emitter = _dereq_('component-emitter');
            const debug = _dereq_('debug')('engine.io-client:socket');
            const index = _dereq_('indexof');
            const parser = _dereq_('engine.io-parser');
            const parseuri = _dereq_('parseuri');
            const parsejson = _dereq_('parsejson');
            const parseqs = _dereq_('parseqs');
            module.exports = Socket;
            function noop() {}
            function Socket(uri, opts) {
              if (!(this instanceof Socket)) return new Socket(uri, opts);
              opts = opts || {};
              if (uri && typeof uri === 'object') {
                opts = uri;
                uri = null;
              }
              if (uri) {
                uri = parseuri(uri);
                opts.hostname = uri.host;
                opts.secure = uri.protocol == 'https' || uri.protocol == 'wss';
                opts.port = uri.port;
                if (uri.query) opts.query = uri.query;
              } else if (opts.host) {
                opts.hostname = parseuri(opts.host).host;
              }
              this.secure =
                opts.secure != null
                  ? opts.secure
                  : global.location && location.protocol == 'https:';
              if (opts.hostname && !opts.port) {
                opts.port = this.secure ? '443' : '80';
              }
              this.agent = opts.agent || false;
              this.hostname =
                opts.hostname ||
                (global.location ? location.hostname : 'localhost');
              this.port =
                opts.port ||
                (global.location && location.port
                  ? location.port
                  : this.secure
                  ? 443
                  : 80);
              this.query = opts.query || {};
              if (typeof this.query === 'string')
                this.query = parseqs.decode(this.query);
              this.upgrade = opts.upgrade !== false;
              this.path = `${(opts.path || '/engine.io').replace(/\/$/, '')}/`;
              this.forceJSONP = !!opts.forceJSONP;
              this.jsonp = opts.jsonp !== false;
              this.forceBase64 = !!opts.forceBase64;
              this.enablesXDR = !!opts.enablesXDR;
              this.timestampParam = opts.timestampParam || 't';
              this.timestampRequests = opts.timestampRequests;
              this.transports = opts.transports || ['polling', 'websocket'];
              this.readyState = '';
              this.writeBuffer = [];
              this.policyPort = opts.policyPort || 843;
              this.rememberUpgrade = opts.rememberUpgrade || false;
              this.binaryType = null;
              this.onlyBinaryUpgrades = opts.onlyBinaryUpgrades;
              this.perMessageDeflate =
                opts.perMessageDeflate !== false
                  ? opts.perMessageDeflate || {}
                  : false;
              if (this.perMessageDeflate === true) this.perMessageDeflate = {};
              if (
                this.perMessageDeflate &&
                this.perMessageDeflate.threshold == null
              ) {
                this.perMessageDeflate.threshold = 1024;
              }
              this.pfx = opts.pfx || null;
              this.key = opts.key || null;
              this.passphrase = opts.passphrase || null;
              this.cert = opts.cert || null;
              this.ca = opts.ca || null;
              this.ciphers = opts.ciphers || null;
              this.rejectUnauthorized =
                opts.rejectUnauthorized === undefined
                  ? null
                  : opts.rejectUnauthorized;
              const freeGlobal = typeof global === 'object' && global;
              if (freeGlobal.global === freeGlobal) {
                if (
                  opts.extraHeaders &&
                  Object.keys(opts.extraHeaders).length > 0
                ) {
                  this.extraHeaders = opts.extraHeaders;
                }
              }
              this.open();
            }
            Socket.priorWebsocketSuccess = false;
            Emitter(Socket.prototype);
            Socket.protocol = parser.protocol;
            Socket.Socket = Socket;
            Socket.Transport = _dereq_('./transport');
            Socket.transports = _dereq_('./transports');
            Socket.parser = _dereq_('engine.io-parser');
            Socket.prototype.createTransport = function (name) {
              debug('creating transport "%s"', name);
              const query = clone(this.query);
              query.EIO = parser.protocol;
              query.transport = name;
              if (this.id) query.sid = this.id;
              const transport = new transports[name]({
                agent: this.agent,
                hostname: this.hostname,
                port: this.port,
                secure: this.secure,
                path: this.path,
                query,
                forceJSONP: this.forceJSONP,
                jsonp: this.jsonp,
                forceBase64: this.forceBase64,
                enablesXDR: this.enablesXDR,
                timestampRequests: this.timestampRequests,
                timestampParam: this.timestampParam,
                policyPort: this.policyPort,
                socket: this,
                pfx: this.pfx,
                key: this.key,
                passphrase: this.passphrase,
                cert: this.cert,
                ca: this.ca,
                ciphers: this.ciphers,
                rejectUnauthorized: this.rejectUnauthorized,
                perMessageDeflate: this.perMessageDeflate,
                extraHeaders: this.extraHeaders,
              });
              return transport;
            };
            function clone(obj) {
              const o = {};
              for (const i in obj) {
                if (obj.hasOwnProperty(i)) {
                  o[i] = obj[i];
                }
              }
              return o;
            }
            Socket.prototype.open = function () {
              let transport;
              if (
                this.rememberUpgrade &&
                Socket.priorWebsocketSuccess &&
                this.transports.indexOf('websocket') != -1
              ) {
                transport = 'websocket';
              } else if (this.transports.length === 0) {
                const self = this;
                setTimeout(() => {
                  self.emit('error', 'No transports available');
                }, 0);
                return;
              } else {
                transport = this.transports[0];
              }
              this.readyState = 'opening';
              try {
                transport = this.createTransport(transport);
              } catch (e) {
                this.transports.shift();
                this.open();
                return;
              }
              transport.open();
              this.setTransport(transport);
            };
            Socket.prototype.setTransport = function (transport) {
              debug('setting transport %s', transport.name);
              const self = this;
              if (this.transport) {
                debug('clearing existing transport %s', this.transport.name);
                this.transport.removeAllListeners();
              }
              this.transport = transport;
              transport
                .on('drain', () => {
                  self.onDrain();
                })
                .on('packet', (packet) => {
                  self.onPacket(packet);
                })
                .on('error', (e) => {
                  self.onError(e);
                })
                .on('close', () => {
                  self.onClose('transport close');
                });
            };
            Socket.prototype.probe = function (name) {
              debug('probing transport "%s"', name);
              let transport = this.createTransport(name, { probe: 1 });
              let failed = false;
              const self = this;
              Socket.priorWebsocketSuccess = false;
              function onTransportOpen() {
                if (self.onlyBinaryUpgrades) {
                  const upgradeLosesBinary =
                    !this.supportsBinary && self.transport.supportsBinary;
                  failed = failed || upgradeLosesBinary;
                }
                if (failed) return;
                debug('probe transport "%s" opened', name);
                transport.send([{ type: 'ping', data: 'probe' }]);
                transport.once('packet', (msg) => {
                  if (failed) return;
                  if (msg.type == 'pong' && msg.data == 'probe') {
                    debug('probe transport "%s" pong', name);
                    self.upgrading = true;
                    self.emit('upgrading', transport);
                    if (!transport) return;
                    Socket.priorWebsocketSuccess =
                      transport.name == 'websocket';
                    debug(
                      'pausing current transport "%s"',
                      self.transport.name,
                    );
                    self.transport.pause(() => {
                      if (failed) return;
                      if (self.readyState == 'closed') return;
                      debug('changing transport and sending upgrade packet');
                      cleanup();
                      self.setTransport(transport);
                      transport.send([{ type: 'upgrade' }]);
                      self.emit('upgrade', transport);
                      transport = null;
                      self.upgrading = false;
                      self.flush();
                    });
                  } else {
                    debug('probe transport "%s" failed', name);
                    const err = new Error('probe error');
                    err.transport = transport.name;
                    self.emit('upgradeError', err);
                  }
                });
              }
              function freezeTransport() {
                if (failed) return;
                failed = true;
                cleanup();
                transport.close();
                transport = null;
              }
              function onerror(err) {
                const error = new Error(`probe error: ${err}`);
                error.transport = transport.name;
                freezeTransport();
                debug(
                  'probe transport "%s" failed because of error: %s',
                  name,
                  err,
                );
                self.emit('upgradeError', error);
              }
              function onTransportClose() {
                onerror('transport closed');
              }
              function onclose() {
                onerror('socket closed');
              }
              function onupgrade(to) {
                if (transport && to.name != transport.name) {
                  debug('"%s" works - aborting "%s"', to.name, transport.name);
                  freezeTransport();
                }
              }
              function cleanup() {
                transport.removeListener('open', onTransportOpen);
                transport.removeListener('error', onerror);
                transport.removeListener('close', onTransportClose);
                self.removeListener('close', onclose);
                self.removeListener('upgrading', onupgrade);
              }
              transport.once('open', onTransportOpen);
              transport.once('error', onerror);
              transport.once('close', onTransportClose);
              this.once('close', onclose);
              this.once('upgrading', onupgrade);
              transport.open();
            };
            Socket.prototype.onOpen = function () {
              debug('socket open');
              this.readyState = 'open';
              Socket.priorWebsocketSuccess = this.transport.name == 'websocket';
              this.emit('open');
              this.flush();
              if (
                this.readyState == 'open' &&
                this.upgrade &&
                this.transport.pause
              ) {
                debug('starting upgrade probes');
                for (let i = 0, l = this.upgrades.length; i < l; i++) {
                  this.probe(this.upgrades[i]);
                }
              }
            };
            Socket.prototype.onPacket = function (packet) {
              if (this.readyState == 'opening' || this.readyState == 'open') {
                debug(
                  'socket receive: type "%s", data "%s"',
                  packet.type,
                  packet.data,
                );
                this.emit('packet', packet);
                this.emit('heartbeat');
                switch (packet.type) {
                  case 'open':
                    this.onHandshake(parsejson(packet.data));
                    break;
                  case 'pong':
                    this.setPing();
                    this.emit('pong');
                    break;
                  case 'error':
                    var err = new Error('server error');
                    err.code = packet.data;
                    this.onError(err);
                    break;
                  case 'message':
                    this.emit('data', packet.data);
                    this.emit('message', packet.data);
                    break;
                }
              } else {
                debug(
                  'packet received with socket readyState "%s"',
                  this.readyState,
                );
              }
            };
            Socket.prototype.onHandshake = function (data) {
              this.emit('handshake', data);
              this.id = data.sid;
              this.transport.query.sid = data.sid;
              this.upgrades = this.filterUpgrades(data.upgrades);
              this.pingInterval = data.pingInterval;
              this.pingTimeout = data.pingTimeout;
              this.onOpen();
              if (this.readyState == 'closed') return;
              this.setPing();
              this.removeListener('heartbeat', this.onHeartbeat);
              this.on('heartbeat', this.onHeartbeat);
            };
            Socket.prototype.onHeartbeat = function (timeout) {
              clearTimeout(this.pingTimeoutTimer);
              const self = this;
              self.pingTimeoutTimer = setTimeout(() => {
                if (self.readyState == 'closed') return;
                self.onClose('ping timeout');
              }, timeout || self.pingInterval + self.pingTimeout);
            };
            Socket.prototype.setPing = function () {
              const self = this;
              clearTimeout(self.pingIntervalTimer);
              self.pingIntervalTimer = setTimeout(() => {
                debug(
                  'writing ping packet - expecting pong within %sms',
                  self.pingTimeout,
                );
                self.ping();
                self.onHeartbeat(self.pingTimeout);
              }, self.pingInterval);
            };
            Socket.prototype.ping = function () {
              const self = this;
              this.sendPacket('ping', () => {
                self.emit('ping');
              });
            };
            Socket.prototype.onDrain = function () {
              this.writeBuffer.splice(0, this.prevBufferLen);
              this.prevBufferLen = 0;
              if (this.writeBuffer.length === 0) {
                this.emit('drain');
              } else {
                this.flush();
              }
            };
            Socket.prototype.flush = function () {
              if (
                this.readyState != 'closed' &&
                this.transport.writable &&
                !this.upgrading &&
                this.writeBuffer.length
              ) {
                debug('flushing %d packets in socket', this.writeBuffer.length);
                this.transport.send(this.writeBuffer);
                this.prevBufferLen = this.writeBuffer.length;
                this.emit('flush');
              }
            };
            Socket.prototype.write = Socket.prototype.send = function (
              msg,
              options,
              fn,
            ) {
              this.sendPacket('message', msg, options, fn);
              return this;
            };
            Socket.prototype.sendPacket = function (type, data, options, fn) {
              if (typeof data === 'function') {
                fn = data;
                data = undefined;
              }
              if (typeof options === 'function') {
                fn = options;
                options = null;
              }
              if (this.readyState == 'closing' || this.readyState == 'closed') {
                return;
              }
              options = options || {};
              options.compress = options.compress !== false;
              const packet = { type, data, options };
              this.emit('packetCreate', packet);
              this.writeBuffer.push(packet);
              if (fn) this.once('flush', fn);
              this.flush();
            };
            Socket.prototype.close = function () {
              if (this.readyState == 'opening' || this.readyState == 'open') {
                this.readyState = 'closing';
                var self = this;
                if (this.writeBuffer.length) {
                  this.once('drain', function () {
                    if (this.upgrading) {
                      waitForUpgrade();
                    } else {
                      close();
                    }
                  });
                } else if (this.upgrading) {
                  waitForUpgrade();
                } else {
                  close();
                }
              }
              function close() {
                self.onClose('forced close');
                debug('socket closing - telling transport to close');
                self.transport.close();
              }
              function cleanupAndClose() {
                self.removeListener('upgrade', cleanupAndClose);
                self.removeListener('upgradeError', cleanupAndClose);
                close();
              }
              function waitForUpgrade() {
                self.once('upgrade', cleanupAndClose);
                self.once('upgradeError', cleanupAndClose);
              }
              return this;
            };
            Socket.prototype.onError = function (err) {
              debug('socket error %j', err);
              Socket.priorWebsocketSuccess = false;
              this.emit('error', err);
              this.onClose('transport error', err);
            };
            Socket.prototype.onClose = function (reason, desc) {
              if (
                this.readyState == 'opening' ||
                this.readyState == 'open' ||
                this.readyState == 'closing'
              ) {
                debug('socket close with reason: "%s"', reason);
                const self = this;
                clearTimeout(this.pingIntervalTimer);
                clearTimeout(this.pingTimeoutTimer);
                this.transport.removeAllListeners('close');
                this.transport.close();
                this.transport.removeAllListeners();
                this.readyState = 'closed';
                this.id = null;
                this.emit('close', reason, desc);
                self.writeBuffer = [];
                self.prevBufferLen = 0;
              }
            };
            Socket.prototype.filterUpgrades = function (upgrades) {
              const filteredUpgrades = [];
              for (let i = 0, j = upgrades.length; i < j; i++) {
                if (~index(this.transports, upgrades[i]))
                  filteredUpgrades.push(upgrades[i]);
              }
              return filteredUpgrades;
            };
          }.call(
            this,
            typeof self !== 'undefined'
              ? self
              : typeof window !== 'undefined'
              ? window
              : typeof global !== 'undefined'
              ? global
              : {},
          ));
        },
        {
          './transport': 4,
          './transports': 5,
          'component-emitter': 15,
          debug: 17,
          'engine.io-parser': 19,
          indexof: 23,
          parsejson: 26,
          parseqs: 27,
          parseuri: 28,
        },
      ],
      4: [
        function (_dereq_, module, exports) {
          const parser = _dereq_('engine.io-parser');
          const Emitter = _dereq_('component-emitter');
          module.exports = Transport;
          function Transport(opts) {
            this.path = opts.path;
            this.hostname = opts.hostname;
            this.port = opts.port;
            this.secure = opts.secure;
            this.query = opts.query;
            this.timestampParam = opts.timestampParam;
            this.timestampRequests = opts.timestampRequests;
            this.readyState = '';
            this.agent = opts.agent || false;
            this.socket = opts.socket;
            this.enablesXDR = opts.enablesXDR;
            this.pfx = opts.pfx;
            this.key = opts.key;
            this.passphrase = opts.passphrase;
            this.cert = opts.cert;
            this.ca = opts.ca;
            this.ciphers = opts.ciphers;
            this.rejectUnauthorized = opts.rejectUnauthorized;
            this.extraHeaders = opts.extraHeaders;
          }
          Emitter(Transport.prototype);
          Transport.prototype.onError = function (msg, desc) {
            const err = new Error(msg);
            err.type = 'TransportError';
            err.description = desc;
            this.emit('error', err);
            return this;
          };
          Transport.prototype.open = function () {
            if (this.readyState == 'closed' || this.readyState == '') {
              this.readyState = 'opening';
              this.doOpen();
            }
            return this;
          };
          Transport.prototype.close = function () {
            if (this.readyState == 'opening' || this.readyState == 'open') {
              this.doClose();
              this.onClose();
            }
            return this;
          };
          Transport.prototype.send = function (packets) {
            if (this.readyState == 'open') {
              this.write(packets);
            } else {
              throw new Error('Transport not open');
            }
          };
          Transport.prototype.onOpen = function () {
            this.readyState = 'open';
            this.writable = true;
            this.emit('open');
          };
          Transport.prototype.onData = function (data) {
            const packet = parser.decodePacket(data, this.socket.binaryType);
            this.onPacket(packet);
          };
          Transport.prototype.onPacket = function (packet) {
            this.emit('packet', packet);
          };
          Transport.prototype.onClose = function () {
            this.readyState = 'closed';
            this.emit('close');
          };
        },
        { 'component-emitter': 15, 'engine.io-parser': 19 },
      ],
      5: [
        function (_dereq_, module, exports) {
          (function (global) {
            const XMLHttpRequest = _dereq_('xmlhttprequest-ssl');
            const XHR = _dereq_('./polling-xhr');
            const JSONP = _dereq_('./polling-jsonp');
            const websocket = _dereq_('./websocket');
            exports.polling = polling;
            exports.websocket = websocket;
            function polling(opts) {
              let xhr;
              let xd = false;
              let xs = false;
              const jsonp = opts.jsonp !== false;
              if (global.location) {
                const isSSL = location.protocol == 'https:';
                let { port } = location;
                if (!port) {
                  port = isSSL ? 443 : 80;
                }
                xd = opts.hostname != location.hostname || port != opts.port;
                xs = opts.secure != isSSL;
              }
              opts.xdomain = xd;
              opts.xscheme = xs;
              xhr = new XMLHttpRequest(opts);
              if ('open' in xhr && !opts.forceJSONP) {
                return new XHR(opts);
              }
              if (!jsonp) throw new Error('JSONP disabled');
              return new JSONP(opts);
            }
          }.call(
            this,
            typeof self !== 'undefined'
              ? self
              : typeof window !== 'undefined'
              ? window
              : typeof global !== 'undefined'
              ? global
              : {},
          ));
        },
        {
          './polling-jsonp': 6,
          './polling-xhr': 7,
          './websocket': 9,
          'xmlhttprequest-ssl': 10,
        },
      ],
      6: [
        function (_dereq_, module, exports) {
          (function (global) {
            const Polling = _dereq_('./polling');
            const inherit = _dereq_('component-inherit');
            module.exports = JSONPPolling;
            const rNewline = /\n/g;
            const rEscapedNewline = /\\n/g;
            let callbacks;
            const index = 0;
            function empty() {}
            function JSONPPolling(opts) {
              Polling.call(this, opts);
              this.query = this.query || {};
              if (!callbacks) {
                if (!global.___eio) global.___eio = [];
                callbacks = global.___eio;
              }
              this.index = callbacks.length;
              const self = this;
              callbacks.push((msg) => {
                self.onData(msg);
              });
              this.query.j = this.index;
              if (global.document && global.addEventListener) {
                global.addEventListener(
                  'beforeunload',
                  () => {
                    if (self.script) self.script.onerror = empty;
                  },
                  false,
                );
              }
            }
            inherit(JSONPPolling, Polling);
            JSONPPolling.prototype.supportsBinary = false;
            JSONPPolling.prototype.doClose = function () {
              if (this.script) {
                this.script.parentNode.removeChild(this.script);
                this.script = null;
              }
              if (this.form) {
                this.form.parentNode.removeChild(this.form);
                this.form = null;
                this.iframe = null;
              }
              Polling.prototype.doClose.call(this);
            };
            JSONPPolling.prototype.doPoll = function () {
              const self = this;
              const script = document.createElement('script');
              if (this.script) {
                this.script.parentNode.removeChild(this.script);
                this.script = null;
              }
              script.async = true;
              script.src = this.uri();
              script.onerror = function (e) {
                self.onError('jsonp poll error', e);
              };
              const insertAt = document.getElementsByTagName('script')[0];
              if (insertAt) {
                insertAt.parentNode.insertBefore(script, insertAt);
              } else {
                (document.head || document.body).appendChild(script);
              }
              this.script = script;
              const isUAgecko =
                typeof navigator !== 'undefined' &&
                /gecko/i.test(navigator.userAgent);
              if (isUAgecko) {
                setTimeout(() => {
                  const iframe = document.createElement('iframe');
                  document.body.appendChild(iframe);
                  document.body.removeChild(iframe);
                }, 100);
              }
            };
            JSONPPolling.prototype.doWrite = function (data, fn) {
              const self = this;
              if (!this.form) {
                const form = document.createElement('form');
                const area = document.createElement('textarea');
                const id = (this.iframeId = `eio_iframe_${this.index}`);
                var iframe;
                form.className = 'socketio';
                form.style.position = 'absolute';
                form.style.top = '-1000px';
                form.style.left = '-1000px';
                form.target = id;
                form.method = 'POST';
                form.setAttribute('accept-charset', 'utf-8');
                area.name = 'd';
                form.appendChild(area);
                document.body.appendChild(form);
                this.form = form;
                this.area = area;
              }
              this.form.action = this.uri();
              function complete() {
                initIframe();
                fn();
              }
              function initIframe() {
                if (self.iframe) {
                  try {
                    self.form.removeChild(self.iframe);
                  } catch (e) {
                    self.onError('jsonp polling iframe removal error', e);
                  }
                }
                try {
                  const html = `<iframe src="javascript:0" name="${self.iframeId}">`;
                  iframe = document.createElement(html);
                } catch (e) {
                  iframe = document.createElement('iframe');
                  iframe.name = self.iframeId;
                  iframe.src = 'javascript:0';
                }
                iframe.id = self.iframeId;
                self.form.appendChild(iframe);
                self.iframe = iframe;
              }
              initIframe();
              data = data.replace(rEscapedNewline, '\\\n');
              this.area.value = data.replace(rNewline, '\\n');
              try {
                this.form.submit();
              } catch (e) {}
              if (this.iframe.attachEvent) {
                this.iframe.onreadystatechange = function () {
                  if (self.iframe.readyState == 'complete') {
                    complete();
                  }
                };
              } else {
                this.iframe.onload = complete;
              }
            };
          }.call(
            this,
            typeof self !== 'undefined'
              ? self
              : typeof window !== 'undefined'
              ? window
              : typeof global !== 'undefined'
              ? global
              : {},
          ));
        },
        { './polling': 8, 'component-inherit': 16 },
      ],
      7: [
        function (_dereq_, module, exports) {
          (function (global) {
            const XMLHttpRequest = _dereq_('xmlhttprequest-ssl');
            const Polling = _dereq_('./polling');
            const Emitter = _dereq_('component-emitter');
            const inherit = _dereq_('component-inherit');
            const debug = _dereq_('debug')('engine.io-client:polling-xhr');
            module.exports = XHR;
            module.exports.Request = Request;
            function empty() {}
            function XHR(opts) {
              Polling.call(this, opts);
              if (global.location) {
                const isSSL = location.protocol == 'https:';
                let { port } = location;
                if (!port) {
                  port = isSSL ? 443 : 80;
                }
                this.xd =
                  opts.hostname != global.location.hostname ||
                  port != opts.port;
                this.xs = opts.secure != isSSL;
              } else {
                this.extraHeaders = opts.extraHeaders;
              }
            }
            inherit(XHR, Polling);
            XHR.prototype.supportsBinary = true;
            XHR.prototype.request = function (opts) {
              opts = opts || {};
              opts.uri = this.uri();
              opts.xd = this.xd;
              opts.xs = this.xs;
              opts.agent = this.agent || false;
              opts.supportsBinary = this.supportsBinary;
              opts.enablesXDR = this.enablesXDR;
              opts.pfx = this.pfx;
              opts.key = this.key;
              opts.passphrase = this.passphrase;
              opts.cert = this.cert;
              opts.ca = this.ca;
              opts.ciphers = this.ciphers;
              opts.rejectUnauthorized = this.rejectUnauthorized;
              opts.extraHeaders = this.extraHeaders;
              return new Request(opts);
            };
            XHR.prototype.doWrite = function (data, fn) {
              const isBinary = typeof data !== 'string' && data !== undefined;
              const req = this.request({
                method: 'POST',
                data,
                isBinary,
              });
              const self = this;
              req.on('success', fn);
              req.on('error', (err) => {
                self.onError('xhr post error', err);
              });
              this.sendXhr = req;
            };
            XHR.prototype.doPoll = function () {
              debug('xhr poll');
              const req = this.request();
              const self = this;
              req.on('data', (data) => {
                self.onData(data);
              });
              req.on('error', (err) => {
                self.onError('xhr poll error', err);
              });
              this.pollXhr = req;
            };
            function Request(opts) {
              this.method = opts.method || 'GET';
              this.uri = opts.uri;
              this.xd = !!opts.xd;
              this.xs = !!opts.xs;
              this.async = opts.async !== false;
              this.data = undefined != opts.data ? opts.data : null;
              this.agent = opts.agent;
              this.isBinary = opts.isBinary;
              this.supportsBinary = opts.supportsBinary;
              this.enablesXDR = opts.enablesXDR;
              this.pfx = opts.pfx;
              this.key = opts.key;
              this.passphrase = opts.passphrase;
              this.cert = opts.cert;
              this.ca = opts.ca;
              this.ciphers = opts.ciphers;
              this.rejectUnauthorized = opts.rejectUnauthorized;
              this.extraHeaders = opts.extraHeaders;
              this.create();
            }
            Emitter(Request.prototype);
            Request.prototype.create = function () {
              const opts = {
                agent: this.agent,
                xdomain: this.xd,
                xscheme: this.xs,
                enablesXDR: this.enablesXDR,
              };
              opts.pfx = this.pfx;
              opts.key = this.key;
              opts.passphrase = this.passphrase;
              opts.cert = this.cert;
              opts.ca = this.ca;
              opts.ciphers = this.ciphers;
              opts.rejectUnauthorized = this.rejectUnauthorized;
              const xhr = (this.xhr = new XMLHttpRequest(opts));
              const self = this;
              try {
                debug('xhr open %s: %s', this.method, this.uri);
                xhr.open(this.method, this.uri, this.async);
                try {
                  if (this.extraHeaders) {
                    xhr.setDisableHeaderCheck(true);
                    for (const i in this.extraHeaders) {
                      if (this.extraHeaders.hasOwnProperty(i)) {
                        xhr.setRequestHeader(i, this.extraHeaders[i]);
                      }
                    }
                  }
                } catch (e) {}
                if (this.supportsBinary) {
                  xhr.responseType = 'arraybuffer';
                }
                if (this.method == 'POST') {
                  try {
                    if (this.isBinary) {
                      xhr.setRequestHeader(
                        'Content-type',
                        'application/octet-stream',
                      );
                    } else {
                      xhr.setRequestHeader(
                        'Content-type',
                        'text/plain;charset=UTF-8',
                      );
                    }
                  } catch (e) {}
                }
                if ('withCredentials' in xhr) {
                  xhr.withCredentials = true;
                }
                if (this.hasXDR()) {
                  xhr.onload = function () {
                    self.onLoad();
                  };
                  xhr.onerror = function () {
                    self.onError(xhr.responseText);
                  };
                } else {
                  xhr.onreadystatechange = function () {
                    if (xhr.readyState != 4) return;
                    if (xhr.status == 200 || xhr.status == 1223) {
                      self.onLoad();
                    } else {
                      setTimeout(() => {
                        self.onError(xhr.status);
                      }, 0);
                    }
                  };
                }
                debug('xhr data %s', this.data);
                xhr.send(this.data);
              } catch (e) {
                setTimeout(() => {
                  self.onError(e);
                }, 0);
                return;
              }
              if (global.document) {
                this.index = Request.requestsCount++;
                Request.requests[this.index] = this;
              }
            };
            Request.prototype.onSuccess = function () {
              this.emit('success');
              this.cleanup();
            };
            Request.prototype.onData = function (data) {
              this.emit('data', data);
              this.onSuccess();
            };
            Request.prototype.onError = function (err) {
              this.emit('error', err);
              this.cleanup(true);
            };
            Request.prototype.cleanup = function (fromError) {
              if (typeof this.xhr === 'undefined' || this.xhr === null) {
                return;
              }
              if (this.hasXDR()) {
                this.xhr.onload = this.xhr.onerror = empty;
              } else {
                this.xhr.onreadystatechange = empty;
              }
              if (fromError) {
                try {
                  this.xhr.abort();
                } catch (e) {}
              }
              if (global.document) {
                delete Request.requests[this.index];
              }
              this.xhr = null;
            };
            Request.prototype.onLoad = function () {
              let data;
              try {
                let contentType;
                try {
                  contentType = this.xhr
                    .getResponseHeader('Content-Type')
                    .split(';')[0];
                } catch (e) {}
                if (contentType === 'application/octet-stream') {
                  data = this.xhr.response;
                } else if (!this.supportsBinary) {
                  data = this.xhr.responseText;
                } else {
                  try {
                    data = String.fromCharCode.apply(
                      null,
                      new Uint8Array(this.xhr.response),
                    );
                  } catch (e) {
                    const ui8Arr = new Uint8Array(this.xhr.response);
                    const dataArray = [];
                    for (
                      let idx = 0, { length } = ui8Arr;
                      idx < length;
                      idx++
                    ) {
                      dataArray.push(ui8Arr[idx]);
                    }
                    data = String.fromCharCode.apply(null, dataArray);
                  }
                }
              } catch (e) {
                this.onError(e);
              }
              if (data != null) {
                this.onData(data);
              }
            };
            Request.prototype.hasXDR = function () {
              return (
                typeof global.XDomainRequest !== 'undefined' &&
                !this.xs &&
                this.enablesXDR
              );
            };
            Request.prototype.abort = function () {
              this.cleanup();
            };
            if (global.document) {
              Request.requestsCount = 0;
              Request.requests = {};
              if (global.attachEvent) {
                global.attachEvent('onunload', unloadHandler);
              } else if (global.addEventListener) {
                global.addEventListener('beforeunload', unloadHandler, false);
              }
            }
            function unloadHandler() {
              for (const i in Request.requests) {
                if (Request.requests.hasOwnProperty(i)) {
                  Request.requests[i].abort();
                }
              }
            }
          }.call(
            this,
            typeof self !== 'undefined'
              ? self
              : typeof window !== 'undefined'
              ? window
              : typeof global !== 'undefined'
              ? global
              : {},
          ));
        },
        {
          './polling': 8,
          'component-emitter': 15,
          'component-inherit': 16,
          debug: 17,
          'xmlhttprequest-ssl': 10,
        },
      ],
      8: [
        function (_dereq_, module, exports) {
          const Transport = _dereq_('../transport');
          const parseqs = _dereq_('parseqs');
          const parser = _dereq_('engine.io-parser');
          const inherit = _dereq_('component-inherit');
          const yeast = _dereq_('yeast');
          const debug = _dereq_('debug')('engine.io-client:polling');
          module.exports = Polling;
          const hasXHR2 = (function () {
            const XMLHttpRequest = _dereq_('xmlhttprequest-ssl');
            const xhr = new XMLHttpRequest({ xdomain: false });
            return xhr.responseType != null;
          })();
          function Polling(opts) {
            const forceBase64 = opts && opts.forceBase64;
            if (!hasXHR2 || forceBase64) {
              this.supportsBinary = false;
            }
            Transport.call(this, opts);
          }
          inherit(Polling, Transport);
          Polling.prototype.name = 'polling';
          Polling.prototype.doOpen = function () {
            this.poll();
          };
          Polling.prototype.pause = function (onPause) {
            const pending = 0;
            const self = this;
            this.readyState = 'pausing';
            function pause() {
              debug('paused');
              self.readyState = 'paused';
              onPause();
            }
            if (this.polling || !this.writable) {
              let total = 0;
              if (this.polling) {
                debug('we are currently polling - waiting to pause');
                total++;
                this.once('pollComplete', () => {
                  debug('pre-pause polling complete');
                  --total || pause();
                });
              }
              if (!this.writable) {
                debug('we are currently writing - waiting to pause');
                total++;
                this.once('drain', () => {
                  debug('pre-pause writing complete');
                  --total || pause();
                });
              }
            } else {
              pause();
            }
          };
          Polling.prototype.poll = function () {
            debug('polling');
            this.polling = true;
            this.doPoll();
            this.emit('poll');
          };
          Polling.prototype.onData = function (data) {
            const self = this;
            debug('polling got data %s', data);
            const callback = function (packet, index, total) {
              if (self.readyState == 'opening') {
                self.onOpen();
              }
              if (packet.type == 'close') {
                self.onClose();
                return false;
              }
              self.onPacket(packet);
            };
            parser.decodePayload(data, this.socket.binaryType, callback);
            if (this.readyState != 'closed') {
              this.polling = false;
              this.emit('pollComplete');
              if (this.readyState == 'open') {
                this.poll();
              } else {
                debug('ignoring poll - transport state "%s"', this.readyState);
              }
            }
          };
          Polling.prototype.doClose = function () {
            const self = this;
            function close() {
              debug('writing close packet');
              self.write([{ type: 'close' }]);
            }
            if (this.readyState == 'open') {
              debug('transport open - closing');
              close();
            } else {
              debug('transport not open - deferring close');
              this.once('open', close);
            }
          };
          Polling.prototype.write = function (packets) {
            var self = this;
            this.writable = false;
            const callbackfn = function () {
              self.writable = true;
              self.emit('drain');
            };
            var self = this;
            parser.encodePayload(packets, this.supportsBinary, (data) => {
              self.doWrite(data, callbackfn);
            });
          };
          Polling.prototype.uri = function () {
            let query = this.query || {};
            const schema = this.secure ? 'https' : 'http';
            let port = '';
            if (this.timestampRequests !== false) {
              query[this.timestampParam] = yeast();
            }
            if (!this.supportsBinary && !query.sid) {
              query.b64 = 1;
            }
            query = parseqs.encode(query);
            if (
              this.port &&
              ((schema == 'https' && this.port != 443) ||
                (schema == 'http' && this.port != 80))
            ) {
              port = `:${this.port}`;
            }
            if (query.length) {
              query = `?${query}`;
            }
            const ipv6 = this.hostname.indexOf(':') !== -1;
            return `${schema}://${
              ipv6 ? `[${this.hostname}]` : this.hostname
            }${port}${this.path}${query}`;
          };
        },
        {
          '../transport': 4,
          'component-inherit': 16,
          debug: 17,
          'engine.io-parser': 19,
          parseqs: 27,
          'xmlhttprequest-ssl': 10,
          yeast: 30,
        },
      ],
      9: [
        function (_dereq_, module, exports) {
          (function (global) {
            const Transport = _dereq_('../transport');
            const parser = _dereq_('engine.io-parser');
            const parseqs = _dereq_('parseqs');
            const inherit = _dereq_('component-inherit');
            const yeast = _dereq_('yeast');
            const debug = _dereq_('debug')('engine.io-client:websocket');
            const BrowserWebSocket = global.WebSocket || global.MozWebSocket;
            let WebSocket = BrowserWebSocket;
            if (!WebSocket && typeof window === 'undefined') {
              try {
                WebSocket = _dereq_('ws');
              } catch (e) {}
            }
            module.exports = WS;
            function WS(opts) {
              const forceBase64 = opts && opts.forceBase64;
              if (forceBase64) {
                this.supportsBinary = false;
              }
              this.perMessageDeflate = opts.perMessageDeflate;
              Transport.call(this, opts);
            }
            inherit(WS, Transport);
            WS.prototype.name = 'websocket';
            WS.prototype.supportsBinary = true;
            WS.prototype.doOpen = function () {
              if (!this.check()) {
                return;
              }
              const self = this;
              const uri = this.uri();
              const protocols = void 0;
              const opts = {
                agent: this.agent,
                perMessageDeflate: this.perMessageDeflate,
              };
              opts.pfx = this.pfx;
              opts.key = this.key;
              opts.passphrase = this.passphrase;
              opts.cert = this.cert;
              opts.ca = this.ca;
              opts.ciphers = this.ciphers;
              opts.rejectUnauthorized = this.rejectUnauthorized;
              if (this.extraHeaders) {
                opts.headers = this.extraHeaders;
              }
              this.ws = BrowserWebSocket
                ? new WebSocket(uri)
                : new WebSocket(uri, protocols, opts);
              if (this.ws.binaryType === undefined) {
                this.supportsBinary = false;
              }
              if (this.ws.supports && this.ws.supports.binary) {
                this.supportsBinary = true;
                this.ws.binaryType = 'buffer';
              } else {
                this.ws.binaryType = 'arraybuffer';
              }
              this.addEventListeners();
            };
            WS.prototype.addEventListeners = function () {
              const self = this;
              this.ws.onopen = function () {
                self.onOpen();
              };
              this.ws.onclose = function () {
                self.onClose();
              };
              this.ws.onmessage = function (ev) {
                self.onData(ev.data);
              };
              this.ws.onerror = function (e) {
                self.onError('websocket error', e);
              };
            };
            if (
              typeof navigator !== 'undefined' &&
              /iPad|iPhone|iPod/i.test(navigator.userAgent)
            ) {
              WS.prototype.onData = function (data) {
                const self = this;
                setTimeout(() => {
                  Transport.prototype.onData.call(self, data);
                }, 0);
              };
            }
            WS.prototype.write = function (packets) {
              const self = this;
              this.writable = false;
              let total = packets.length;
              for (let i = 0, l = total; i < l; i++) {
                (function (packet) {
                  parser.encodePacket(packet, self.supportsBinary, (data) => {
                    if (!BrowserWebSocket) {
                      var opts = {};
                      if (packet.options) {
                        opts.compress = packet.options.compress;
                      }
                      if (self.perMessageDeflate) {
                        const len =
                          typeof data === 'string'
                            ? global.Buffer.byteLength(data)
                            : data.length;
                        if (len < self.perMessageDeflate.threshold) {
                          opts.compress = false;
                        }
                      }
                    }
                    try {
                      if (BrowserWebSocket) {
                        self.ws.send(data);
                      } else {
                        self.ws.send(data, opts);
                      }
                    } catch (e) {
                      debug('websocket closed before onclose event');
                    }
                    --total || done();
                  });
                })(packets[i]);
              }
              function done() {
                self.emit('flush');
                setTimeout(() => {
                  self.writable = true;
                  self.emit('drain');
                }, 0);
              }
            };
            WS.prototype.onClose = function () {
              Transport.prototype.onClose.call(this);
            };
            WS.prototype.doClose = function () {
              if (typeof this.ws !== 'undefined') {
                this.ws.close();
              }
            };
            WS.prototype.uri = function () {
              let query = this.query || {};
              const schema = this.secure ? 'wss' : 'ws';
              let port = '';
              if (
                this.port &&
                ((schema == 'wss' && this.port != 443) ||
                  (schema == 'ws' && this.port != 80))
              ) {
                port = `:${this.port}`;
              }
              if (this.timestampRequests) {
                query[this.timestampParam] = yeast();
              }
              if (!this.supportsBinary) {
                query.b64 = 1;
              }
              query = parseqs.encode(query);
              if (query.length) {
                query = `?${query}`;
              }
              const ipv6 = this.hostname.indexOf(':') !== -1;
              return `${schema}://${
                ipv6 ? `[${this.hostname}]` : this.hostname
              }${port}${this.path}${query}`;
            };
            WS.prototype.check = function () {
              return (
                !!WebSocket &&
                !(
                  '__initialize' in WebSocket && this.name === WS.prototype.name
                )
              );
            };
          }.call(
            this,
            typeof self !== 'undefined'
              ? self
              : typeof window !== 'undefined'
              ? window
              : typeof global !== 'undefined'
              ? global
              : {},
          ));
        },
        {
          '../transport': 4,
          'component-inherit': 16,
          debug: 17,
          'engine.io-parser': 19,
          parseqs: 27,
          ws: undefined,
          yeast: 30,
        },
      ],
      10: [
        function (_dereq_, module, exports) {
          const hasCORS = _dereq_('has-cors');
          module.exports = function (opts) {
            const { xdomain } = opts;
            const { xscheme } = opts;
            const { enablesXDR } = opts;
            try {
              if (
                typeof XMLHttpRequest !== 'undefined' &&
                (!xdomain || hasCORS)
              ) {
                return new XMLHttpRequest();
              }
            } catch (e) {}
            try {
              if (
                typeof XDomainRequest !== 'undefined' &&
                !xscheme &&
                enablesXDR
              ) {
                return new XDomainRequest();
              }
            } catch (e) {}
            if (!xdomain) {
              try {
                return new ActiveXObject('Microsoft.XMLHTTP');
              } catch (e) {}
            }
          };
        },
        { 'has-cors': 22 },
      ],
      11: [
        function (_dereq_, module, exports) {
          module.exports = after;
          function after(count, callback, err_cb) {
            let bail = false;
            err_cb = err_cb || noop;
            proxy.count = count;
            return count === 0 ? callback() : proxy;
            function proxy(err, result) {
              if (proxy.count <= 0) {
                throw new Error('after called too many times');
              }
              --proxy.count;
              if (err) {
                bail = true;
                callback(err);
                callback = err_cb;
              } else if (proxy.count === 0 && !bail) {
                callback(null, result);
              }
            }
          }
          function noop() {}
        },
        {},
      ],
      12: [
        function (_dereq_, module, exports) {
          module.exports = function (arraybuffer, start, end) {
            const bytes = arraybuffer.byteLength;
            start = start || 0;
            end = end || bytes;
            if (arraybuffer.slice) {
              return arraybuffer.slice(start, end);
            }
            if (start < 0) {
              start += bytes;
            }
            if (end < 0) {
              end += bytes;
            }
            if (end > bytes) {
              end = bytes;
            }
            if (start >= bytes || start >= end || bytes === 0) {
              return new ArrayBuffer(0);
            }
            const abv = new Uint8Array(arraybuffer);
            const result = new Uint8Array(end - start);
            for (let i = start, ii = 0; i < end; i++, ii++) {
              result[ii] = abv[i];
            }
            return result.buffer;
          };
        },
        {},
      ],
      13: [
        function (_dereq_, module, exports) {
          (function (chars) {
            exports.encode = function (arraybuffer) {
              const bytes = new Uint8Array(arraybuffer);
              let i;
              const len = bytes.length;
              let base64 = '';
              for (i = 0; i < len; i += 3) {
                base64 += chars[bytes[i] >> 2];
                base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
                base64 +=
                  chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
                base64 += chars[bytes[i + 2] & 63];
              }
              if (len % 3 === 2) {
                base64 = `${base64.substring(0, base64.length - 1)}=`;
              } else if (len % 3 === 1) {
                base64 = `${base64.substring(0, base64.length - 2)}==`;
              }
              return base64;
            };
            exports.decode = function (base64) {
              let bufferLength = base64.length * 0.75;
              const len = base64.length;
              let i;
              let p = 0;
              let encoded1;
              let encoded2;
              let encoded3;
              let encoded4;
              if (base64[base64.length - 1] === '=') {
                bufferLength--;
                if (base64[base64.length - 2] === '=') {
                  bufferLength--;
                }
              }
              const arraybuffer = new ArrayBuffer(bufferLength);
              const bytes = new Uint8Array(arraybuffer);
              for (i = 0; i < len; i += 4) {
                encoded1 = chars.indexOf(base64[i]);
                encoded2 = chars.indexOf(base64[i + 1]);
                encoded3 = chars.indexOf(base64[i + 2]);
                encoded4 = chars.indexOf(base64[i + 3]);
                bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
                bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
                bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
              }
              return arraybuffer;
            };
          })(
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
          );
        },
        {},
      ],
      14: [
        function (_dereq_, module, exports) {
          (function (global) {
            const BlobBuilder =
              global.BlobBuilder ||
              global.WebKitBlobBuilder ||
              global.MSBlobBuilder ||
              global.MozBlobBuilder;
            const blobSupported = (function () {
              try {
                const a = new Blob(['hi']);
                return a.size === 2;
              } catch (e) {
                return false;
              }
            })();
            const blobSupportsArrayBufferView =
              blobSupported &&
              (function () {
                try {
                  const b = new Blob([new Uint8Array([1, 2])]);
                  return b.size === 2;
                } catch (e) {
                  return false;
                }
              })();
            const blobBuilderSupported =
              BlobBuilder &&
              BlobBuilder.prototype.append &&
              BlobBuilder.prototype.getBlob;
            function mapArrayBufferViews(ary) {
              for (let i = 0; i < ary.length; i++) {
                const chunk = ary[i];
                if (chunk.buffer instanceof ArrayBuffer) {
                  let buf = chunk.buffer;
                  if (chunk.byteLength !== buf.byteLength) {
                    const copy = new Uint8Array(chunk.byteLength);
                    copy.set(
                      new Uint8Array(buf, chunk.byteOffset, chunk.byteLength),
                    );
                    buf = copy.buffer;
                  }
                  ary[i] = buf;
                }
              }
            }
            function BlobBuilderConstructor(ary, options) {
              options = options || {};
              const bb = new BlobBuilder();
              mapArrayBufferViews(ary);
              for (let i = 0; i < ary.length; i++) {
                bb.append(ary[i]);
              }
              return options.type ? bb.getBlob(options.type) : bb.getBlob();
            }
            function BlobConstructor(ary, options) {
              mapArrayBufferViews(ary);
              return new Blob(ary, options || {});
            }
            module.exports = (function () {
              if (blobSupported) {
                return blobSupportsArrayBufferView
                  ? global.Blob
                  : BlobConstructor;
              }
              if (blobBuilderSupported) {
                return BlobBuilderConstructor;
              }
              return undefined;
            })();
          }.call(
            this,
            typeof self !== 'undefined'
              ? self
              : typeof window !== 'undefined'
              ? window
              : typeof global !== 'undefined'
              ? global
              : {},
          ));
        },
        {},
      ],
      15: [
        function (_dereq_, module, exports) {
          module.exports = Emitter;
          function Emitter(obj) {
            if (obj) return mixin(obj);
          }
          function mixin(obj) {
            for (const key in Emitter.prototype) {
              obj[key] = Emitter.prototype[key];
            }
            return obj;
          }
          Emitter.prototype.on = Emitter.prototype.addEventListener = function (
            event,
            fn,
          ) {
            this._callbacks = this._callbacks || {};
            (this._callbacks[event] = this._callbacks[event] || []).push(fn);
            return this;
          };
          Emitter.prototype.once = function (event, fn) {
            const self = this;
            this._callbacks = this._callbacks || {};
            function on() {
              self.off(event, on);
              fn.apply(this, arguments);
            }
            on.fn = fn;
            this.on(event, on);
            return this;
          };
          Emitter.prototype.off =
            Emitter.prototype.removeListener =
            Emitter.prototype.removeAllListeners =
            Emitter.prototype.removeEventListener =
              function (event, fn) {
                this._callbacks = this._callbacks || {};
                if (arguments.length == 0) {
                  this._callbacks = {};
                  return this;
                }
                const callbacks = this._callbacks[event];
                if (!callbacks) return this;
                if (arguments.length == 1) {
                  delete this._callbacks[event];
                  return this;
                }
                let cb;
                for (let i = 0; i < callbacks.length; i++) {
                  cb = callbacks[i];
                  if (cb === fn || cb.fn === fn) {
                    callbacks.splice(i, 1);
                    break;
                  }
                }
                return this;
              };
          Emitter.prototype.emit = function (event) {
            this._callbacks = this._callbacks || {};
            const args = [].slice.call(arguments, 1);
            let callbacks = this._callbacks[event];
            if (callbacks) {
              callbacks = callbacks.slice(0);
              for (let i = 0, len = callbacks.length; i < len; ++i) {
                callbacks[i].apply(this, args);
              }
            }
            return this;
          };
          Emitter.prototype.listeners = function (event) {
            this._callbacks = this._callbacks || {};
            return this._callbacks[event] || [];
          };
          Emitter.prototype.hasListeners = function (event) {
            return !!this.listeners(event).length;
          };
        },
        {},
      ],
      16: [
        function (_dereq_, module, exports) {
          module.exports = function (a, b) {
            const fn = function () {};
            fn.prototype = b.prototype;
            a.prototype = new fn();
            a.prototype.constructor = a;
          };
        },
        {},
      ],
      17: [
        function (_dereq_, module, exports) {
          exports = module.exports = _dereq_('./debug');
          exports.log = log;
          exports.formatArgs = formatArgs;
          exports.save = save;
          exports.load = load;
          exports.useColors = useColors;
          exports.storage =
            typeof chrome !== 'undefined' &&
            typeof chrome.storage !== 'undefined'
              ? chrome.storage.local
              : localstorage();
          exports.colors = [
            'lightseagreen',
            'forestgreen',
            'goldenrod',
            'dodgerblue',
            'darkorchid',
            'crimson',
          ];
          function useColors() {
            return (
              'WebkitAppearance' in document.documentElement.style ||
              (window.console &&
                (console.firebug || (console.exception && console.table))) ||
              (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) &&
                parseInt(RegExp.$1, 10) >= 31)
            );
          }
          exports.formatters.j = function (v) {
            return JSON.stringify(v);
          };
          function formatArgs() {
            let args = arguments;
            const { useColors } = this;
            args[0] = `${
              (useColors ? '%c' : '') +
              this.namespace +
              (useColors ? ' %c' : ' ') +
              args[0] +
              (useColors ? '%c ' : ' ')
            }+${exports.humanize(this.diff)}`;
            if (!useColors) return args;
            const c = `color: ${this.color}`;
            args = [args[0], c, 'color: inherit'].concat(
              Array.prototype.slice.call(args, 1),
            );
            let index = 0;
            let lastC = 0;
            args[0].replace(/%[a-z%]/g, (match) => {
              if (match === '%%') return;
              index++;
              if (match === '%c') {
                lastC = index;
              }
            });
            args.splice(lastC, 0, c);
            return args;
          }
          function log() {
            return (
              typeof console === 'object' &&
              console.log &&
              Function.prototype.apply.call(console.log, console, arguments)
            );
          }
          function save(namespaces) {
            try {
              if (namespaces == null) {
                exports.storage.removeItem('debug');
              } else {
                exports.storage.debug = namespaces;
              }
            } catch (e) {}
          }
          function load() {
            let r;
            try {
              r = exports.storage.debug;
            } catch (e) {}
            return r;
          }
          exports.enable(load());
          function localstorage() {
            try {
              return window.localStorage;
            } catch (e) {}
          }
        },
        { './debug': 18 },
      ],
      18: [
        function (_dereq_, module, exports) {
          exports = module.exports = debug;
          exports.coerce = coerce;
          exports.disable = disable;
          exports.enable = enable;
          exports.enabled = enabled;
          exports.humanize = _dereq_('ms');
          exports.names = [];
          exports.skips = [];
          exports.formatters = {};
          let prevColor = 0;
          let prevTime;
          function selectColor() {
            return exports.colors[prevColor++ % exports.colors.length];
          }
          function debug(namespace) {
            function disabled() {}
            disabled.enabled = false;
            function enabled() {
              const self = enabled;
              const curr = +new Date();
              const ms = curr - (prevTime || curr);
              self.diff = ms;
              self.prev = prevTime;
              self.curr = curr;
              prevTime = curr;
              if (self.useColors == null) self.useColors = exports.useColors();
              if (self.color == null && self.useColors)
                self.color = selectColor();
              let args = Array.prototype.slice.call(arguments);
              args[0] = exports.coerce(args[0]);
              if (typeof args[0] !== 'string') {
                args = ['%o'].concat(args);
              }
              let index = 0;
              args[0] = args[0].replace(/%([a-z%])/g, (match, format) => {
                if (match === '%%') return match;
                index++;
                const formatter = exports.formatters[format];
                if (typeof formatter === 'function') {
                  const val = args[index];
                  match = formatter.call(self, val);
                  args.splice(index, 1);
                  index--;
                }
                return match;
              });
              if (typeof exports.formatArgs === 'function') {
                args = exports.formatArgs.apply(self, args);
              }
              const logFn =
                enabled.log || exports.log || console.log.bind(console);
              logFn.apply(self, args);
            }
            enabled.enabled = true;
            const fn = exports.enabled(namespace) ? enabled : disabled;
            fn.namespace = namespace;
            return fn;
          }
          function enable(namespaces) {
            exports.save(namespaces);
            const split = (namespaces || '').split(/[\s,]+/);
            const len = split.length;
            for (let i = 0; i < len; i++) {
              if (!split[i]) continue;
              namespaces = split[i].replace(/\*/g, '.*?');
              if (namespaces[0] === '-') {
                exports.skips.push(new RegExp(`^${namespaces.substr(1)}$`));
              } else {
                exports.names.push(new RegExp(`^${namespaces}$`));
              }
            }
          }
          function disable() {
            exports.enable('');
          }
          function enabled(name) {
            let i;
            let len;
            for (i = 0, len = exports.skips.length; i < len; i++) {
              if (exports.skips[i].test(name)) {
                return false;
              }
            }
            for (i = 0, len = exports.names.length; i < len; i++) {
              if (exports.names[i].test(name)) {
                return true;
              }
            }
            return false;
          }
          function coerce(val) {
            if (val instanceof Error) return val.stack || val.message;
            return val;
          }
        },
        { ms: 25 },
      ],
      19: [
        function (_dereq_, module, exports) {
          (function (global) {
            const keys = _dereq_('./keys');
            const hasBinary = _dereq_('has-binary');
            const sliceBuffer = _dereq_('arraybuffer.slice');
            const base64encoder = _dereq_('base64-arraybuffer');
            const after = _dereq_('after');
            const utf8 = _dereq_('utf8');
            const isAndroid = navigator.userAgent.match(/Android/i);
            const isPhantomJS = /PhantomJS/i.test(navigator.userAgent);
            const dontSendBlobs = isAndroid || isPhantomJS;
            exports.protocol = 3;
            const packets = (exports.packets = {
              open: 0,
              close: 1,
              ping: 2,
              pong: 3,
              message: 4,
              upgrade: 5,
              noop: 6,
            });
            const packetslist = keys(packets);
            const err = { type: 'error', data: 'parser error' };
            const Blob = _dereq_('blob');
            exports.encodePacket = function (
              packet,
              supportsBinary,
              utf8encode,
              callback,
            ) {
              if (typeof supportsBinary === 'function') {
                callback = supportsBinary;
                supportsBinary = false;
              }
              if (typeof utf8encode === 'function') {
                callback = utf8encode;
                utf8encode = null;
              }
              const data =
                packet.data === undefined
                  ? undefined
                  : packet.data.buffer || packet.data;
              if (global.ArrayBuffer && data instanceof ArrayBuffer) {
                return encodeArrayBuffer(packet, supportsBinary, callback);
              }
              if (Blob && data instanceof global.Blob) {
                return encodeBlob(packet, supportsBinary, callback);
              }
              if (data && data.base64) {
                return encodeBase64Object(packet, callback);
              }
              let encoded = packets[packet.type];
              if (undefined !== packet.data) {
                encoded += utf8encode
                  ? utf8.encode(String(packet.data))
                  : String(packet.data);
              }
              return callback(`${encoded}`);
            };
            function encodeBase64Object(packet, callback) {
              const message = `b${exports.packets[packet.type]}${
                packet.data.data
              }`;
              return callback(message);
            }
            function encodeArrayBuffer(packet, supportsBinary, callback) {
              if (!supportsBinary) {
                return exports.encodeBase64Packet(packet, callback);
              }
              const { data } = packet;
              const contentArray = new Uint8Array(data);
              const resultBuffer = new Uint8Array(1 + data.byteLength);
              resultBuffer[0] = packets[packet.type];
              for (let i = 0; i < contentArray.length; i++) {
                resultBuffer[i + 1] = contentArray[i];
              }
              return callback(resultBuffer.buffer);
            }
            function encodeBlobAsArrayBuffer(packet, supportsBinary, callback) {
              if (!supportsBinary) {
                return exports.encodeBase64Packet(packet, callback);
              }
              const fr = new FileReader();
              fr.onload = function () {
                packet.data = fr.result;
                exports.encodePacket(packet, supportsBinary, true, callback);
              };
              return fr.readAsArrayBuffer(packet.data);
            }
            function encodeBlob(packet, supportsBinary, callback) {
              if (!supportsBinary) {
                return exports.encodeBase64Packet(packet, callback);
              }
              if (dontSendBlobs) {
                return encodeBlobAsArrayBuffer(
                  packet,
                  supportsBinary,
                  callback,
                );
              }
              const length = new Uint8Array(1);
              length[0] = packets[packet.type];
              const blob = new Blob([length.buffer, packet.data]);
              return callback(blob);
            }
            exports.encodeBase64Packet = function (packet, callback) {
              let message = `b${exports.packets[packet.type]}`;
              if (Blob && packet.data instanceof global.Blob) {
                const fr = new FileReader();
                fr.onload = function () {
                  const b64 = fr.result.split(',')[1];
                  callback(message + b64);
                };
                return fr.readAsDataURL(packet.data);
              }
              let b64data;
              try {
                b64data = String.fromCharCode.apply(
                  null,
                  new Uint8Array(packet.data),
                );
              } catch (e) {
                const typed = new Uint8Array(packet.data);
                const basic = new Array(typed.length);
                for (let i = 0; i < typed.length; i++) {
                  basic[i] = typed[i];
                }
                b64data = String.fromCharCode.apply(null, basic);
              }
              message += global.btoa(b64data);
              return callback(message);
            };
            exports.decodePacket = function (data, binaryType, utf8decode) {
              if (typeof data === 'string' || data === undefined) {
                if (data.charAt(0) == 'b') {
                  return exports.decodeBase64Packet(data.substr(1), binaryType);
                }
                if (utf8decode) {
                  try {
                    data = utf8.decode(data);
                  } catch (e) {
                    return err;
                  }
                }
                var type = data.charAt(0);
                if (Number(type) != type || !packetslist[type]) {
                  return err;
                }
                if (data.length > 1) {
                  return { type: packetslist[type], data: data.substring(1) };
                }
                return { type: packetslist[type] };
              }
              const asArray = new Uint8Array(data);
              var type = asArray[0];
              let rest = sliceBuffer(data, 1);
              if (Blob && binaryType === 'blob') {
                rest = new Blob([rest]);
              }
              return { type: packetslist[type], data: rest };
            };
            exports.decodeBase64Packet = function (msg, binaryType) {
              const type = packetslist[msg.charAt(0)];
              if (!global.ArrayBuffer) {
                return {
                  type,
                  data: { base64: true, data: msg.substr(1) },
                };
              }
              let data = base64encoder.decode(msg.substr(1));
              if (binaryType === 'blob' && Blob) {
                data = new Blob([data]);
              }
              return { type, data };
            };
            exports.encodePayload = function (
              packets,
              supportsBinary,
              callback,
            ) {
              if (typeof supportsBinary === 'function') {
                callback = supportsBinary;
                supportsBinary = null;
              }
              const isBinary = hasBinary(packets);
              if (supportsBinary && isBinary) {
                if (Blob && !dontSendBlobs) {
                  return exports.encodePayloadAsBlob(packets, callback);
                }
                return exports.encodePayloadAsArrayBuffer(packets, callback);
              }
              if (!packets.length) {
                return callback('0:');
              }
              function setLengthHeader(message) {
                return `${message.length}:${message}`;
              }
              function encodeOne(packet, doneCallback) {
                exports.encodePacket(
                  packet,
                  !isBinary ? false : supportsBinary,
                  true,
                  (message) => {
                    doneCallback(null, setLengthHeader(message));
                  },
                );
              }
              map(packets, encodeOne, (err, results) =>
                callback(results.join('')),
              );
            };
            function map(ary, each, done) {
              const result = new Array(ary.length);
              const next = after(ary.length, done);
              const eachWithIndex = function (i, el, cb) {
                each(el, (error, msg) => {
                  result[i] = msg;
                  cb(error, result);
                });
              };
              for (let i = 0; i < ary.length; i++) {
                eachWithIndex(i, ary[i], next);
              }
            }
            exports.decodePayload = function (data, binaryType, callback) {
              if (typeof data !== 'string') {
                return exports.decodePayloadAsBinary(
                  data,
                  binaryType,
                  callback,
                );
              }
              if (typeof binaryType === 'function') {
                callback = binaryType;
                binaryType = null;
              }
              let packet;
              if (data == '') {
                return callback(err, 0, 1);
              }
              let length = '';
              let n;
              let msg;
              for (let i = 0, l = data.length; i < l; i++) {
                const chr = data.charAt(i);
                if (chr != ':') {
                  length += chr;
                } else {
                  if (length == '' || length != (n = Number(length))) {
                    return callback(err, 0, 1);
                  }
                  msg = data.substr(i + 1, n);
                  if (length != msg.length) {
                    return callback(err, 0, 1);
                  }
                  if (msg.length) {
                    packet = exports.decodePacket(msg, binaryType, true);
                    if (err.type == packet.type && err.data == packet.data) {
                      return callback(err, 0, 1);
                    }
                    const ret = callback(packet, i + n, l);
                    if (ret === false) return;
                  }
                  i += n;
                  length = '';
                }
              }
              if (length != '') {
                return callback(err, 0, 1);
              }
            };
            exports.encodePayloadAsArrayBuffer = function (packets, callback) {
              if (!packets.length) {
                return callback(new ArrayBuffer(0));
              }
              function encodeOne(packet, doneCallback) {
                exports.encodePacket(packet, true, true, (data) =>
                  doneCallback(null, data),
                );
              }
              map(packets, encodeOne, (err, encodedPackets) => {
                const totalLength = encodedPackets.reduce((acc, p) => {
                  let len;
                  if (typeof p === 'string') {
                    len = p.length;
                  } else {
                    len = p.byteLength;
                  }
                  return acc + len.toString().length + len + 2;
                }, 0);
                const resultArray = new Uint8Array(totalLength);
                let bufferIndex = 0;
                encodedPackets.forEach((p) => {
                  const isString = typeof p === 'string';
                  let ab = p;
                  if (isString) {
                    var view = new Uint8Array(p.length);
                    for (var i = 0; i < p.length; i++) {
                      view[i] = p.charCodeAt(i);
                    }
                    ab = view.buffer;
                  }
                  if (isString) {
                    resultArray[bufferIndex++] = 0;
                  } else {
                    resultArray[bufferIndex++] = 1;
                  }
                  const lenStr = ab.byteLength.toString();
                  for (var i = 0; i < lenStr.length; i++) {
                    resultArray[bufferIndex++] = parseInt(lenStr[i]);
                  }
                  resultArray[bufferIndex++] = 255;
                  var view = new Uint8Array(ab);
                  for (var i = 0; i < view.length; i++) {
                    resultArray[bufferIndex++] = view[i];
                  }
                });
                return callback(resultArray.buffer);
              });
            };
            exports.encodePayloadAsBlob = function (packets, callback) {
              function encodeOne(packet, doneCallback) {
                exports.encodePacket(packet, true, true, (encoded) => {
                  const binaryIdentifier = new Uint8Array(1);
                  binaryIdentifier[0] = 1;
                  if (typeof encoded === 'string') {
                    const view = new Uint8Array(encoded.length);
                    for (var i = 0; i < encoded.length; i++) {
                      view[i] = encoded.charCodeAt(i);
                    }
                    encoded = view.buffer;
                    binaryIdentifier[0] = 0;
                  }
                  const len =
                    encoded instanceof ArrayBuffer
                      ? encoded.byteLength
                      : encoded.size;
                  const lenStr = len.toString();
                  const lengthAry = new Uint8Array(lenStr.length + 1);
                  for (var i = 0; i < lenStr.length; i++) {
                    lengthAry[i] = parseInt(lenStr[i]);
                  }
                  lengthAry[lenStr.length] = 255;
                  if (Blob) {
                    const blob = new Blob([
                      binaryIdentifier.buffer,
                      lengthAry.buffer,
                      encoded,
                    ]);
                    doneCallback(null, blob);
                  }
                });
              }
              map(packets, encodeOne, (err, results) =>
                callback(new Blob(results)),
              );
            };
            exports.decodePayloadAsBinary = function (
              data,
              binaryType,
              callback,
            ) {
              if (typeof binaryType === 'function') {
                callback = binaryType;
                binaryType = null;
              }
              let bufferTail = data;
              const buffers = [];
              let numberTooLong = false;
              while (bufferTail.byteLength > 0) {
                const tailArray = new Uint8Array(bufferTail);
                const isString = tailArray[0] === 0;
                let msgLength = '';
                for (var i = 1; ; i++) {
                  if (tailArray[i] == 255) break;
                  if (msgLength.length > 310) {
                    numberTooLong = true;
                    break;
                  }
                  msgLength += tailArray[i];
                }
                if (numberTooLong) return callback(err, 0, 1);
                bufferTail = sliceBuffer(bufferTail, 2 + msgLength.length);
                msgLength = parseInt(msgLength);
                let msg = sliceBuffer(bufferTail, 0, msgLength);
                if (isString) {
                  try {
                    msg = String.fromCharCode.apply(null, new Uint8Array(msg));
                  } catch (e) {
                    const typed = new Uint8Array(msg);
                    msg = '';
                    for (var i = 0; i < typed.length; i++) {
                      msg += String.fromCharCode(typed[i]);
                    }
                  }
                }
                buffers.push(msg);
                bufferTail = sliceBuffer(bufferTail, msgLength);
              }
              const total = buffers.length;
              buffers.forEach((buffer, i) => {
                callback(
                  exports.decodePacket(buffer, binaryType, true),
                  i,
                  total,
                );
              });
            };
          }.call(
            this,
            typeof self !== 'undefined'
              ? self
              : typeof window !== 'undefined'
              ? window
              : typeof global !== 'undefined'
              ? global
              : {},
          ));
        },
        {
          './keys': 20,
          after: 11,
          'arraybuffer.slice': 12,
          'base64-arraybuffer': 13,
          blob: 14,
          'has-binary': 21,
          utf8: 29,
        },
      ],
      20: [
        function (_dereq_, module, exports) {
          module.exports =
            Object.keys ||
            function keys(obj) {
              const arr = [];
              const has = Object.prototype.hasOwnProperty;
              for (const i in obj) {
                if (has.call(obj, i)) {
                  arr.push(i);
                }
              }
              return arr;
            };
        },
        {},
      ],
      21: [
        function (_dereq_, module, exports) {
          (function (global) {
            const isArray = _dereq_('isarray');
            module.exports = hasBinary;
            function hasBinary(data) {
              function _hasBinary(obj) {
                if (!obj) return false;
                if (
                  (global.Buffer && global.Buffer.isBuffer(obj)) ||
                  (global.ArrayBuffer && obj instanceof ArrayBuffer) ||
                  (global.Blob && obj instanceof Blob) ||
                  (global.File && obj instanceof File)
                ) {
                  return true;
                }
                if (isArray(obj)) {
                  for (let i = 0; i < obj.length; i++) {
                    if (_hasBinary(obj[i])) {
                      return true;
                    }
                  }
                } else if (obj && typeof obj === 'object') {
                  if (obj.toJSON) {
                    obj = obj.toJSON();
                  }
                  for (const key in obj) {
                    if (
                      Object.prototype.hasOwnProperty.call(obj, key) &&
                      _hasBinary(obj[key])
                    ) {
                      return true;
                    }
                  }
                }
                return false;
              }
              return _hasBinary(data);
            }
          }.call(
            this,
            typeof self !== 'undefined'
              ? self
              : typeof window !== 'undefined'
              ? window
              : typeof global !== 'undefined'
              ? global
              : {},
          ));
        },
        { isarray: 24 },
      ],
      22: [
        function (_dereq_, module, exports) {
          try {
            module.exports =
              typeof XMLHttpRequest !== 'undefined' &&
              'withCredentials' in new XMLHttpRequest();
          } catch (err) {
            module.exports = false;
          }
        },
        {},
      ],
      23: [
        function (_dereq_, module, exports) {
          const { indexOf } = [];
          module.exports = function (arr, obj) {
            if (indexOf) return arr.indexOf(obj);
            for (let i = 0; i < arr.length; ++i) {
              if (arr[i] === obj) return i;
            }
            return -1;
          };
        },
        {},
      ],
      24: [
        function (_dereq_, module, exports) {
          module.exports =
            Array.isArray ||
            function (arr) {
              return Object.prototype.toString.call(arr) == '[object Array]';
            };
        },
        {},
      ],
      25: [
        function (_dereq_, module, exports) {
          const s = 1e3;
          const m = s * 60;
          const h = m * 60;
          const d = h * 24;
          const y = d * 365.25;
          module.exports = function (val, options) {
            options = options || {};
            if (typeof val === 'string') return parse(val);
            return options.long ? long(val) : short(val);
          };
          function parse(str) {
            str = `${str}`;
            if (str.length > 1e4) return;
            const match =
              /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
                str,
              );
            if (!match) return;
            const n = parseFloat(match[1]);
            const type = (match[2] || 'ms').toLowerCase();
            switch (type) {
              case 'years':
              case 'year':
              case 'yrs':
              case 'yr':
              case 'y':
                return n * y;
              case 'days':
              case 'day':
              case 'd':
                return n * d;
              case 'hours':
              case 'hour':
              case 'hrs':
              case 'hr':
              case 'h':
                return n * h;
              case 'minutes':
              case 'minute':
              case 'mins':
              case 'min':
              case 'm':
                return n * m;
              case 'seconds':
              case 'second':
              case 'secs':
              case 'sec':
              case 's':
                return n * s;
              case 'milliseconds':
              case 'millisecond':
              case 'msecs':
              case 'msec':
              case 'ms':
                return n;
            }
          }
          function short(ms) {
            if (ms >= d) return `${Math.round(ms / d)}d`;
            if (ms >= h) return `${Math.round(ms / h)}h`;
            if (ms >= m) return `${Math.round(ms / m)}m`;
            if (ms >= s) return `${Math.round(ms / s)}s`;
            return `${ms}ms`;
          }
          function long(ms) {
            return (
              plural(ms, d, 'day') ||
              plural(ms, h, 'hour') ||
              plural(ms, m, 'minute') ||
              plural(ms, s, 'second') ||
              `${ms} ms`
            );
          }
          function plural(ms, n, name) {
            if (ms < n) return;
            if (ms < n * 1.5) return `${Math.floor(ms / n)} ${name}`;
            return `${Math.ceil(ms / n)} ${name}s`;
          }
        },
        {},
      ],
      26: [
        function (_dereq_, module, exports) {
          (function (global) {
            const rvalidchars = /^[\],:{}\s]*$/;
            const rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
            const rvalidtokens =
              /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
            const rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
            const rtrimLeft = /^\s+/;
            const rtrimRight = /\s+$/;
            module.exports = function parsejson(data) {
              if (typeof data !== 'string' || !data) {
                return null;
              }
              data = data.replace(rtrimLeft, '').replace(rtrimRight, '');
              if (global.JSON && JSON.parse) {
                return JSON.parse(data);
              }
              if (
                rvalidchars.test(
                  data
                    .replace(rvalidescape, '@')
                    .replace(rvalidtokens, ']')
                    .replace(rvalidbraces, ''),
                )
              ) {
                return new Function(`return ${data}`)();
              }
            };
          }.call(
            this,
            typeof self !== 'undefined'
              ? self
              : typeof window !== 'undefined'
              ? window
              : typeof global !== 'undefined'
              ? global
              : {},
          ));
        },
        {},
      ],
      27: [
        function (_dereq_, module, exports) {
          exports.encode = function (obj) {
            let str = '';
            for (const i in obj) {
              if (obj.hasOwnProperty(i)) {
                if (str.length) str += '&';
                str += `${encodeURIComponent(i)}=${encodeURIComponent(obj[i])}`;
              }
            }
            return str;
          };
          exports.decode = function (qs) {
            const qry = {};
            const pairs = qs.split('&');
            for (let i = 0, l = pairs.length; i < l; i++) {
              const pair = pairs[i].split('=');
              qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
            }
            return qry;
          };
        },
        {},
      ],
      28: [
        function (_dereq_, module, exports) {
          const re =
            /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
          const parts = [
            'source',
            'protocol',
            'authority',
            'userInfo',
            'user',
            'password',
            'host',
            'port',
            'relative',
            'path',
            'directory',
            'file',
            'query',
            'anchor',
          ];
          module.exports = function parseuri(str) {
            const src = str;
            const b = str.indexOf('[');
            const e = str.indexOf(']');
            if (b != -1 && e != -1) {
              str =
                str.substring(0, b) +
                str.substring(b, e).replace(/:/g, ';') +
                str.substring(e, str.length);
            }
            const m = re.exec(str || '');
            const uri = {};
            let i = 14;
            while (i--) {
              uri[parts[i]] = m[i] || '';
            }
            if (b != -1 && e != -1) {
              uri.source = src;
              uri.host = uri.host
                .substring(1, uri.host.length - 1)
                .replace(/;/g, ':');
              uri.authority = uri.authority
                .replace('[', '')
                .replace(']', '')
                .replace(/;/g, ':');
              uri.ipv6uri = true;
            }
            return uri;
          };
        },
        {},
      ],
      29: [
        function (_dereq_, module, exports) {
          (function (global) {
            (function (root) {
              const freeExports = typeof exports === 'object' && exports;
              const freeModule =
                typeof module === 'object' &&
                module &&
                module.exports == freeExports &&
                module;
              const freeGlobal = typeof global === 'object' && global;
              if (
                freeGlobal.global === freeGlobal ||
                freeGlobal.window === freeGlobal
              ) {
                root = freeGlobal;
              }
              const stringFromCharCode = String.fromCharCode;
              function ucs2decode(string) {
                const output = [];
                let counter = 0;
                const { length } = string;
                let value;
                let extra;
                while (counter < length) {
                  value = string.charCodeAt(counter++);
                  if (value >= 55296 && value <= 56319 && counter < length) {
                    extra = string.charCodeAt(counter++);
                    if ((extra & 64512) == 56320) {
                      output.push(
                        ((value & 1023) << 10) + (extra & 1023) + 65536,
                      );
                    } else {
                      output.push(value);
                      counter--;
                    }
                  } else {
                    output.push(value);
                  }
                }
                return output;
              }
              function ucs2encode(array) {
                const { length } = array;
                let index = -1;
                let value;
                let output = '';
                while (++index < length) {
                  value = array[index];
                  if (value > 65535) {
                    value -= 65536;
                    output += stringFromCharCode(
                      ((value >>> 10) & 1023) | 55296,
                    );
                    value = 56320 | (value & 1023);
                  }
                  output += stringFromCharCode(value);
                }
                return output;
              }
              function checkScalarValue(codePoint) {
                if (codePoint >= 55296 && codePoint <= 57343) {
                  throw Error(
                    `Lone surrogate U+${codePoint
                      .toString(16)
                      .toUpperCase()} is not a scalar value`,
                  );
                }
              }
              function createByte(codePoint, shift) {
                return stringFromCharCode(((codePoint >> shift) & 63) | 128);
              }
              function encodeCodePoint(codePoint) {
                if ((codePoint & 4294967168) == 0) {
                  return stringFromCharCode(codePoint);
                }
                let symbol = '';
                if ((codePoint & 4294965248) == 0) {
                  symbol = stringFromCharCode(((codePoint >> 6) & 31) | 192);
                } else if ((codePoint & 4294901760) == 0) {
                  checkScalarValue(codePoint);
                  symbol = stringFromCharCode(((codePoint >> 12) & 15) | 224);
                  symbol += createByte(codePoint, 6);
                } else if ((codePoint & 4292870144) == 0) {
                  symbol = stringFromCharCode(((codePoint >> 18) & 7) | 240);
                  symbol += createByte(codePoint, 12);
                  symbol += createByte(codePoint, 6);
                }
                symbol += stringFromCharCode((codePoint & 63) | 128);
                return symbol;
              }
              function utf8encode(string) {
                const codePoints = ucs2decode(string);
                const { length } = codePoints;
                let index = -1;
                let codePoint;
                let byteString = '';
                while (++index < length) {
                  codePoint = codePoints[index];
                  byteString += encodeCodePoint(codePoint);
                }
                return byteString;
              }
              function readContinuationByte() {
                if (byteIndex >= byteCount) {
                  throw Error('Invalid byte index');
                }
                const continuationByte = byteArray[byteIndex] & 255;
                byteIndex++;
                if ((continuationByte & 192) == 128) {
                  return continuationByte & 63;
                }
                throw Error('Invalid continuation byte');
              }
              function decodeSymbol() {
                let byte1;
                var byte2;
                let byte3;
                let byte4;
                let codePoint;
                if (byteIndex > byteCount) {
                  throw Error('Invalid byte index');
                }
                if (byteIndex == byteCount) {
                  return false;
                }
                byte1 = byteArray[byteIndex] & 255;
                byteIndex++;
                if ((byte1 & 128) == 0) {
                  return byte1;
                }
                if ((byte1 & 224) == 192) {
                  var byte2 = readContinuationByte();
                  codePoint = ((byte1 & 31) << 6) | byte2;
                  if (codePoint >= 128) {
                    return codePoint;
                  }
                  throw Error('Invalid continuation byte');
                }
                if ((byte1 & 240) == 224) {
                  byte2 = readContinuationByte();
                  byte3 = readContinuationByte();
                  codePoint = ((byte1 & 15) << 12) | (byte2 << 6) | byte3;
                  if (codePoint >= 2048) {
                    checkScalarValue(codePoint);
                    return codePoint;
                  }
                  throw Error('Invalid continuation byte');
                }
                if ((byte1 & 248) == 240) {
                  byte2 = readContinuationByte();
                  byte3 = readContinuationByte();
                  byte4 = readContinuationByte();
                  codePoint =
                    ((byte1 & 15) << 18) | (byte2 << 12) | (byte3 << 6) | byte4;
                  if (codePoint >= 65536 && codePoint <= 1114111) {
                    return codePoint;
                  }
                }
                throw Error('Invalid UTF-8 detected');
              }
              let byteArray;
              let byteCount;
              let byteIndex;
              function utf8decode(byteString) {
                byteArray = ucs2decode(byteString);
                byteCount = byteArray.length;
                byteIndex = 0;
                const codePoints = [];
                let tmp;
                while ((tmp = decodeSymbol()) !== false) {
                  codePoints.push(tmp);
                }
                return ucs2encode(codePoints);
              }
              const utf8 = {
                version: '2.0.0',
                encode: utf8encode,
                decode: utf8decode,
              };
              if (
                typeof define === 'function' &&
                typeof define.amd === 'object' &&
                define.amd
              ) {
                define(() => utf8);
              } else if (freeExports && !freeExports.nodeType) {
                if (freeModule) {
                  freeModule.exports = utf8;
                } else {
                  const object = {};
                  const { hasOwnProperty } = object;
                  for (const key in utf8) {
                    hasOwnProperty.call(utf8, key) &&
                      (freeExports[key] = utf8[key]);
                  }
                }
              } else {
                root.utf8 = utf8;
              }
            })(this);
          }.call(
            this,
            typeof self !== 'undefined'
              ? self
              : typeof window !== 'undefined'
              ? window
              : typeof global !== 'undefined'
              ? global
              : {},
          ));
        },
        {},
      ],
      30: [
        function (_dereq_, module, exports) {
          const alphabet =
            '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'.split(
              '',
            );
          const length = 64;
          const map = {};
          let seed = 0;
          let i = 0;
          let prev;
          function encode(num) {
            let encoded = '';
            do {
              encoded = alphabet[num % length] + encoded;
              num = Math.floor(num / length);
            } while (num > 0);
            return encoded;
          }
          function decode(str) {
            let decoded = 0;
            for (i = 0; i < str.length; i++) {
              decoded = decoded * length + map[str.charAt(i)];
            }
            return decoded;
          }
          function yeast() {
            const now = encode(+new Date());
            if (now !== prev) return (seed = 0), (prev = now);
            return `${now}.${encode(seed++)}`;
          }
          for (; i < length; i++) map[alphabet[i]] = i;
          yeast.encode = encode;
          yeast.decode = decode;
          module.exports = yeast;
        },
        {},
      ],
      31: [
        function (_dereq_, module, exports) {
          const url = _dereq_('./url');
          const parser = _dereq_('socket.io-parser');
          const Manager = _dereq_('./manager');
          const debug = _dereq_('debug')('socket.io-client');
          module.exports = exports = lookup;
          const cache = (exports.managers = {});
          function lookup(uri, opts) {
            if (typeof uri === 'object') {
              opts = uri;
              uri = undefined;
            }
            opts = opts || {};
            const parsed = url(uri);
            const { source } = parsed;
            const { id } = parsed;
            const { path } = parsed;
            const sameNamespace = cache[id] && path in cache[id].nsps;
            const newConnection =
              opts.forceNew ||
              opts['force new connection'] ||
              opts.multiplex === false ||
              sameNamespace;
            let io;
            if (newConnection) {
              debug('ignoring socket cache for %s', source);
              io = Manager(source, opts);
            } else {
              if (!cache[id]) {
                debug('new io instance for %s', source);
                cache[id] = Manager(source, opts);
              }
              io = cache[id];
            }
            return io.socket(parsed.path);
          }
          exports.protocol = parser.protocol;
          exports.connect = lookup;
          exports.Manager = _dereq_('./manager');
          exports.Socket = _dereq_('./socket');
        },
        {
          './manager': 32,
          './socket': 34,
          './url': 35,
          debug: 39,
          'socket.io-parser': 47,
        },
      ],
      32: [
        function (_dereq_, module, exports) {
          const eio = _dereq_('engine.io-client');
          const Socket = _dereq_('./socket');
          const Emitter = _dereq_('component-emitter');
          const parser = _dereq_('socket.io-parser');
          const on = _dereq_('./on');
          const bind = _dereq_('component-bind');
          const debug = _dereq_('debug')('socket.io-client:manager');
          const indexOf = _dereq_('indexof');
          const Backoff = _dereq_('backo2');
          const has = Object.prototype.hasOwnProperty;
          module.exports = Manager;
          function Manager(uri, opts) {
            if (!(this instanceof Manager)) return new Manager(uri, opts);
            if (uri && typeof uri === 'object') {
              opts = uri;
              uri = undefined;
            }
            opts = opts || {};
            opts.path = opts.path || '/socket.io';
            this.nsps = {};
            this.subs = [];
            this.opts = opts;
            this.reconnection(opts.reconnection !== false);
            this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
            this.reconnectionDelay(opts.reconnectionDelay || 1e3);
            this.reconnectionDelayMax(opts.reconnectionDelayMax || 5e3);
            this.randomizationFactor(opts.randomizationFactor || 0.5);
            this.backoff = new Backoff({
              min: this.reconnectionDelay(),
              max: this.reconnectionDelayMax(),
              jitter: this.randomizationFactor(),
            });
            this.timeout(opts.timeout == null ? 2e4 : opts.timeout);
            this.readyState = 'closed';
            this.uri = uri;
            this.connecting = [];
            this.lastPing = null;
            this.encoding = false;
            this.packetBuffer = [];
            this.encoder = new parser.Encoder();
            this.decoder = new parser.Decoder();
            this.autoConnect = opts.autoConnect !== false;
            if (this.autoConnect) this.open();
          }
          Manager.prototype.emitAll = function () {
            this.emit.apply(this, arguments);
            for (const nsp in this.nsps) {
              if (has.call(this.nsps, nsp)) {
                this.nsps[nsp].emit.apply(this.nsps[nsp], arguments);
              }
            }
          };
          Manager.prototype.updateSocketIds = function () {
            for (const nsp in this.nsps) {
              if (has.call(this.nsps, nsp)) {
                this.nsps[nsp].id = this.engine.id;
              }
            }
          };
          Emitter(Manager.prototype);
          Manager.prototype.reconnection = function (v) {
            if (!arguments.length) return this._reconnection;
            this._reconnection = !!v;
            return this;
          };
          Manager.prototype.reconnectionAttempts = function (v) {
            if (!arguments.length) return this._reconnectionAttempts;
            this._reconnectionAttempts = v;
            return this;
          };
          Manager.prototype.reconnectionDelay = function (v) {
            if (!arguments.length) return this._reconnectionDelay;
            this._reconnectionDelay = v;
            this.backoff && this.backoff.setMin(v);
            return this;
          };
          Manager.prototype.randomizationFactor = function (v) {
            if (!arguments.length) return this._randomizationFactor;
            this._randomizationFactor = v;
            this.backoff && this.backoff.setJitter(v);
            return this;
          };
          Manager.prototype.reconnectionDelayMax = function (v) {
            if (!arguments.length) return this._reconnectionDelayMax;
            this._reconnectionDelayMax = v;
            this.backoff && this.backoff.setMax(v);
            return this;
          };
          Manager.prototype.timeout = function (v) {
            if (!arguments.length) return this._timeout;
            this._timeout = v;
            return this;
          };
          Manager.prototype.maybeReconnectOnOpen = function () {
            if (
              !this.reconnecting &&
              this._reconnection &&
              this.backoff.attempts === 0
            ) {
              this.reconnect();
            }
          };
          Manager.prototype.open = Manager.prototype.connect = function (fn) {
            debug('readyState %s', this.readyState);
            if (~this.readyState.indexOf('open')) return this;
            debug('opening %s', this.uri);
            this.engine = eio(this.uri, this.opts);
            const socket = this.engine;
            const self = this;
            this.readyState = 'opening';
            this.skipReconnect = false;
            const openSub = on(socket, 'open', () => {
              self.onopen();
              fn && fn();
            });
            const errorSub = on(socket, 'error', (data) => {
              debug('connect_error');
              self.cleanup();
              self.readyState = 'closed';
              self.emitAll('connect_error', data);
              if (fn) {
                const err = new Error('Connection error');
                err.data = data;
                fn(err);
              } else {
                self.maybeReconnectOnOpen();
              }
            });
            if (this._timeout !== false) {
              const timeout = this._timeout;
              debug('connect attempt will timeout after %d', timeout);
              const timer = setTimeout(() => {
                debug('connect attempt timed out after %d', timeout);
                openSub.destroy();
                socket.close();
                socket.emit('error', 'timeout');
                self.emitAll('connect_timeout', timeout);
              }, timeout);
              this.subs.push({
                destroy() {
                  clearTimeout(timer);
                },
              });
            }
            this.subs.push(openSub);
            this.subs.push(errorSub);
            return this;
          };
          Manager.prototype.onopen = function () {
            debug('open');
            this.cleanup();
            this.readyState = 'open';
            this.emit('open');
            const socket = this.engine;
            this.subs.push(on(socket, 'data', bind(this, 'ondata')));
            this.subs.push(on(socket, 'ping', bind(this, 'onping')));
            this.subs.push(on(socket, 'pong', bind(this, 'onpong')));
            this.subs.push(on(socket, 'error', bind(this, 'onerror')));
            this.subs.push(on(socket, 'close', bind(this, 'onclose')));
            this.subs.push(
              on(this.decoder, 'decoded', bind(this, 'ondecoded')),
            );
          };
          Manager.prototype.onping = function () {
            this.lastPing = new Date();
            this.emitAll('ping');
          };
          Manager.prototype.onpong = function () {
            this.emitAll('pong', new Date() - this.lastPing);
          };
          Manager.prototype.ondata = function (data) {
            this.decoder.add(data);
          };
          Manager.prototype.ondecoded = function (packet) {
            this.emit('packet', packet);
          };
          Manager.prototype.onerror = function (err) {
            debug('error', err);
            this.emitAll('error', err);
          };
          Manager.prototype.socket = function (nsp) {
            let socket = this.nsps[nsp];
            if (!socket) {
              socket = new Socket(this, nsp);
              this.nsps[nsp] = socket;
              var self = this;
              socket.on('connecting', onConnecting);
              socket.on('connect', () => {
                socket.id = self.engine.id;
              });
              if (this.autoConnect) {
                onConnecting();
              }
            }
            function onConnecting() {
              if (!~indexOf(self.connecting, socket)) {
                self.connecting.push(socket);
              }
            }
            return socket;
          };
          Manager.prototype.destroy = function (socket) {
            const index = indexOf(this.connecting, socket);
            if (~index) this.connecting.splice(index, 1);
            if (this.connecting.length) return;
            this.close();
          };
          Manager.prototype.packet = function (packet) {
            debug('writing packet %j', packet);
            const self = this;
            if (!self.encoding) {
              self.encoding = true;
              this.encoder.encode(packet, (encodedPackets) => {
                for (let i = 0; i < encodedPackets.length; i++) {
                  self.engine.write(encodedPackets[i], packet.options);
                }
                self.encoding = false;
                self.processPacketQueue();
              });
            } else {
              self.packetBuffer.push(packet);
            }
          };
          Manager.prototype.processPacketQueue = function () {
            if (this.packetBuffer.length > 0 && !this.encoding) {
              const pack = this.packetBuffer.shift();
              this.packet(pack);
            }
          };
          Manager.prototype.cleanup = function () {
            debug('cleanup');
            let sub;
            while ((sub = this.subs.shift())) sub.destroy();
            this.packetBuffer = [];
            this.encoding = false;
            this.lastPing = null;
            this.decoder.destroy();
          };
          Manager.prototype.close = Manager.prototype.disconnect = function () {
            debug('disconnect');
            this.skipReconnect = true;
            this.reconnecting = false;
            if (this.readyState == 'opening') {
              this.cleanup();
            }
            this.backoff.reset();
            this.readyState = 'closed';
            if (this.engine) this.engine.close();
          };
          Manager.prototype.onclose = function (reason) {
            debug('onclose');
            this.cleanup();
            this.backoff.reset();
            this.readyState = 'closed';
            this.emit('close', reason);
            if (this._reconnection && !this.skipReconnect) {
              this.reconnect();
            }
          };
          Manager.prototype.reconnect = function () {
            if (this.reconnecting || this.skipReconnect) return this;
            const self = this;
            if (this.backoff.attempts >= this._reconnectionAttempts) {
              debug('reconnect failed');
              this.backoff.reset();
              this.emitAll('reconnect_failed');
              this.reconnecting = false;
            } else {
              const delay = this.backoff.duration();
              debug('will wait %dms before reconnect attempt', delay);
              this.reconnecting = true;
              const timer = setTimeout(() => {
                if (self.skipReconnect) return;
                debug('attempting reconnect');
                self.emitAll('reconnect_attempt', self.backoff.attempts);
                self.emitAll('reconnecting', self.backoff.attempts);
                if (self.skipReconnect) return;
                self.open((err) => {
                  if (err) {
                    debug('reconnect attempt error');
                    self.reconnecting = false;
                    self.reconnect();
                    self.emitAll('reconnect_error', err.data);
                  } else {
                    debug('reconnect success');
                    self.onreconnect();
                  }
                });
              }, delay);
              this.subs.push({
                destroy() {
                  clearTimeout(timer);
                },
              });
            }
          };
          Manager.prototype.onreconnect = function () {
            const attempt = this.backoff.attempts;
            this.reconnecting = false;
            this.backoff.reset();
            this.updateSocketIds();
            this.emitAll('reconnect', attempt);
          };
        },
        {
          './on': 33,
          './socket': 34,
          backo2: 36,
          'component-bind': 37,
          'component-emitter': 38,
          debug: 39,
          'engine.io-client': 1,
          indexof: 42,
          'socket.io-parser': 47,
        },
      ],
      33: [
        function (_dereq_, module, exports) {
          module.exports = on;
          function on(obj, ev, fn) {
            obj.on(ev, fn);
            return {
              destroy() {
                obj.removeListener(ev, fn);
              },
            };
          }
        },
        {},
      ],
      34: [
        function (_dereq_, module, exports) {
          const parser = _dereq_('socket.io-parser');
          const Emitter = _dereq_('component-emitter');
          const toArray = _dereq_('to-array');
          const on = _dereq_('./on');
          const bind = _dereq_('component-bind');
          const debug = _dereq_('debug')('socket.io-client:socket');
          const hasBin = _dereq_('has-binary');
          module.exports = exports = Socket;
          const events = {
            connect: 1,
            connect_error: 1,
            connect_timeout: 1,
            connecting: 1,
            disconnect: 1,
            error: 1,
            reconnect: 1,
            reconnect_attempt: 1,
            reconnect_failed: 1,
            reconnect_error: 1,
            reconnecting: 1,
            ping: 1,
            pong: 1,
          };
          const { emit } = Emitter.prototype;
          function Socket(io, nsp) {
            this.io = io;
            this.nsp = nsp;
            this.json = this;
            this.ids = 0;
            this.acks = {};
            this.receiveBuffer = [];
            this.sendBuffer = [];
            this.connected = false;
            this.disconnected = true;
            if (this.io.autoConnect) this.open();
          }
          Emitter(Socket.prototype);
          Socket.prototype.subEvents = function () {
            if (this.subs) return;
            const { io } = this;
            this.subs = [
              on(io, 'open', bind(this, 'onopen')),
              on(io, 'packet', bind(this, 'onpacket')),
              on(io, 'close', bind(this, 'onclose')),
            ];
          };
          Socket.prototype.open = Socket.prototype.connect = function () {
            if (this.connected) return this;
            this.subEvents();
            this.io.open();
            if (this.io.readyState == 'open') this.onopen();
            this.emit('connecting');
            return this;
          };
          Socket.prototype.send = function () {
            const args = toArray(arguments);
            args.unshift('message');
            this.emit.apply(this, args);
            return this;
          };
          Socket.prototype.emit = function (ev) {
            if (events.hasOwnProperty(ev)) {
              emit.apply(this, arguments);
              return this;
            }
            const args = toArray(arguments);
            let parserType = parser.EVENT;
            if (hasBin(args)) {
              parserType = parser.BINARY_EVENT;
            }
            const packet = { type: parserType, data: args };
            packet.options = {};
            packet.options.compress =
              !this.flags || this.flags.compress !== false;
            if (typeof args[args.length - 1] === 'function') {
              debug('emitting packet with ack id %d', this.ids);
              this.acks[this.ids] = args.pop();
              packet.id = this.ids++;
            }
            if (this.connected) {
              this.packet(packet);
            } else {
              this.sendBuffer.push(packet);
            }
            delete this.flags;
            return this;
          };
          Socket.prototype.packet = function (packet) {
            packet.nsp = this.nsp;
            this.io.packet(packet);
          };
          Socket.prototype.onopen = function () {
            debug('transport is open - connecting');
            if (this.nsp != '/') {
              this.packet({ type: parser.CONNECT });
            }
          };
          Socket.prototype.onclose = function (reason) {
            debug('close (%s)', reason);
            this.connected = false;
            this.disconnected = true;
            delete this.id;
            this.emit('disconnect', reason);
          };
          Socket.prototype.onpacket = function (packet) {
            if (packet.nsp != this.nsp) return;
            switch (packet.type) {
              case parser.CONNECT:
                this.onconnect();
                break;
              case parser.EVENT:
                this.onevent(packet);
                break;
              case parser.BINARY_EVENT:
                this.onevent(packet);
                break;
              case parser.ACK:
                this.onack(packet);
                break;
              case parser.BINARY_ACK:
                this.onack(packet);
                break;
              case parser.DISCONNECT:
                this.ondisconnect();
                break;
              case parser.ERROR:
                this.emit('error', packet.data);
                break;
            }
          };
          Socket.prototype.onevent = function (packet) {
            const args = packet.data || [];
            debug('emitting event %j', args);
            if (packet.id != null) {
              debug('attaching ack callback to event');
              args.push(this.ack(packet.id));
            }
            if (this.connected) {
              emit.apply(this, args);
            } else {
              this.receiveBuffer.push(args);
            }
          };
          Socket.prototype.ack = function (id) {
            const self = this;
            let sent = false;
            return function () {
              if (sent) return;
              sent = true;
              const args = toArray(arguments);
              debug('sending ack %j', args);
              const type = hasBin(args) ? parser.BINARY_ACK : parser.ACK;
              self.packet({ type, id, data: args });
            };
          };
          Socket.prototype.onack = function (packet) {
            const ack = this.acks[packet.id];
            if (typeof ack === 'function') {
              debug('calling ack %s with %j', packet.id, packet.data);
              ack.apply(this, packet.data);
              delete this.acks[packet.id];
            } else {
              debug('bad ack %s', packet.id);
            }
          };
          Socket.prototype.onconnect = function () {
            this.connected = true;
            this.disconnected = false;
            this.emit('connect');
            this.emitBuffered();
          };
          Socket.prototype.emitBuffered = function () {
            let i;
            for (i = 0; i < this.receiveBuffer.length; i++) {
              emit.apply(this, this.receiveBuffer[i]);
            }
            this.receiveBuffer = [];
            for (i = 0; i < this.sendBuffer.length; i++) {
              this.packet(this.sendBuffer[i]);
            }
            this.sendBuffer = [];
          };
          Socket.prototype.ondisconnect = function () {
            debug('server disconnect (%s)', this.nsp);
            this.destroy();
            this.onclose('io server disconnect');
          };
          Socket.prototype.destroy = function () {
            if (this.subs) {
              for (let i = 0; i < this.subs.length; i++) {
                this.subs[i].destroy();
              }
              this.subs = null;
            }
            this.io.destroy(this);
          };
          Socket.prototype.close = Socket.prototype.disconnect = function () {
            if (this.connected) {
              debug('performing disconnect (%s)', this.nsp);
              this.packet({ type: parser.DISCONNECT });
            }
            this.destroy();
            if (this.connected) {
              this.onclose('io client disconnect');
            }
            return this;
          };
          Socket.prototype.compress = function (compress) {
            this.flags = this.flags || {};
            this.flags.compress = compress;
            return this;
          };
        },
        {
          './on': 33,
          'component-bind': 37,
          'component-emitter': 38,
          debug: 39,
          'has-binary': 41,
          'socket.io-parser': 47,
          'to-array': 51,
        },
      ],
      35: [
        function (_dereq_, module, exports) {
          (function (global) {
            const parseuri = _dereq_('parseuri');
            const debug = _dereq_('debug')('socket.io-client:url');
            module.exports = url;
            function url(uri, loc) {
              let obj = uri;
              var loc = loc || global.location;
              if (uri == null) uri = `${loc.protocol}//${loc.host}`;
              if (typeof uri === 'string') {
                if (uri.charAt(0) == '/') {
                  if (uri.charAt(1) == '/') {
                    uri = loc.protocol + uri;
                  } else {
                    uri = loc.host + uri;
                  }
                }
                if (!/^(https?|wss?):\/\//.test(uri)) {
                  debug('protocol-less url %s', uri);
                  if (typeof loc !== 'undefined') {
                    uri = `${loc.protocol}//${uri}`;
                  } else {
                    uri = `https://${uri}`;
                  }
                }
                debug('parse %s', uri);
                obj = parseuri(uri);
              }
              if (!obj.port) {
                if (/^(http|ws)$/.test(obj.protocol)) {
                  obj.port = '80';
                } else if (/^(http|ws)s$/.test(obj.protocol)) {
                  obj.port = '443';
                }
              }
              obj.path = obj.path || '/';
              const ipv6 = obj.host.indexOf(':') !== -1;
              const host = ipv6 ? `[${obj.host}]` : obj.host;
              obj.id = `${obj.protocol}://${host}:${obj.port}`;
              obj.href = `${obj.protocol}://${host}${
                loc && loc.port == obj.port ? '' : `:${obj.port}`
              }`;
              return obj;
            }
          }.call(
            this,
            typeof self !== 'undefined'
              ? self
              : typeof window !== 'undefined'
              ? window
              : typeof global !== 'undefined'
              ? global
              : {},
          ));
        },
        { debug: 39, parseuri: 45 },
      ],
      36: [
        function (_dereq_, module, exports) {
          module.exports = Backoff;
          function Backoff(opts) {
            opts = opts || {};
            this.ms = opts.min || 100;
            this.max = opts.max || 1e4;
            this.factor = opts.factor || 2;
            this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
            this.attempts = 0;
          }
          Backoff.prototype.duration = function () {
            let ms = this.ms * Math.pow(this.factor, this.attempts++);
            if (this.jitter) {
              const rand = Math.random();
              const deviation = Math.floor(rand * this.jitter * ms);
              ms =
                (Math.floor(rand * 10) & 1) == 0
                  ? ms - deviation
                  : ms + deviation;
            }
            return Math.min(ms, this.max) | 0;
          };
          Backoff.prototype.reset = function () {
            this.attempts = 0;
          };
          Backoff.prototype.setMin = function (min) {
            this.ms = min;
          };
          Backoff.prototype.setMax = function (max) {
            this.max = max;
          };
          Backoff.prototype.setJitter = function (jitter) {
            this.jitter = jitter;
          };
        },
        {},
      ],
      37: [
        function (_dereq_, module, exports) {
          const { slice } = [];
          module.exports = function (obj, fn) {
            if (typeof fn === 'string') fn = obj[fn];
            if (typeof fn !== 'function')
              throw new Error('bind() requires a function');
            const args = slice.call(arguments, 2);
            return function () {
              return fn.apply(obj, args.concat(slice.call(arguments)));
            };
          };
        },
        {},
      ],
      38: [
        function (_dereq_, module, exports) {
          module.exports = Emitter;
          function Emitter(obj) {
            if (obj) return mixin(obj);
          }
          function mixin(obj) {
            for (const key in Emitter.prototype) {
              obj[key] = Emitter.prototype[key];
            }
            return obj;
          }
          Emitter.prototype.on = Emitter.prototype.addEventListener = function (
            event,
            fn,
          ) {
            this._callbacks = this._callbacks || {};
            (this._callbacks[`$${event}`] =
              this._callbacks[`$${event}`] || []).push(fn);
            return this;
          };
          Emitter.prototype.once = function (event, fn) {
            function on() {
              this.off(event, on);
              fn.apply(this, arguments);
            }
            on.fn = fn;
            this.on(event, on);
            return this;
          };
          Emitter.prototype.off =
            Emitter.prototype.removeListener =
            Emitter.prototype.removeAllListeners =
            Emitter.prototype.removeEventListener =
              function (event, fn) {
                this._callbacks = this._callbacks || {};
                if (arguments.length == 0) {
                  this._callbacks = {};
                  return this;
                }
                const callbacks = this._callbacks[`$${event}`];
                if (!callbacks) return this;
                if (arguments.length == 1) {
                  delete this._callbacks[`$${event}`];
                  return this;
                }
                let cb;
                for (let i = 0; i < callbacks.length; i++) {
                  cb = callbacks[i];
                  if (cb === fn || cb.fn === fn) {
                    callbacks.splice(i, 1);
                    break;
                  }
                }
                return this;
              };
          Emitter.prototype.emit = function (event) {
            this._callbacks = this._callbacks || {};
            const args = [].slice.call(arguments, 1);
            let callbacks = this._callbacks[`$${event}`];
            if (callbacks) {
              callbacks = callbacks.slice(0);
              for (let i = 0, len = callbacks.length; i < len; ++i) {
                callbacks[i].apply(this, args);
              }
            }
            return this;
          };
          Emitter.prototype.listeners = function (event) {
            this._callbacks = this._callbacks || {};
            return this._callbacks[`$${event}`] || [];
          };
          Emitter.prototype.hasListeners = function (event) {
            return !!this.listeners(event).length;
          };
        },
        {},
      ],
      39: [
        function (_dereq_, module, exports) {
          arguments[4][17][0].apply(exports, arguments);
        },
        { './debug': 40, dup: 17 },
      ],
      40: [
        function (_dereq_, module, exports) {
          arguments[4][18][0].apply(exports, arguments);
        },
        { dup: 18, ms: 44 },
      ],
      41: [
        function (_dereq_, module, exports) {
          (function (global) {
            const isArray = _dereq_('isarray');
            module.exports = hasBinary;
            function hasBinary(data) {
              function _hasBinary(obj) {
                if (!obj) return false;
                if (
                  (global.Buffer &&
                    global.Buffer.isBuffer &&
                    global.Buffer.isBuffer(obj)) ||
                  (global.ArrayBuffer && obj instanceof ArrayBuffer) ||
                  (global.Blob && obj instanceof Blob) ||
                  (global.File && obj instanceof File)
                ) {
                  return true;
                }
                if (isArray(obj)) {
                  for (let i = 0; i < obj.length; i++) {
                    if (_hasBinary(obj[i])) {
                      return true;
                    }
                  }
                } else if (obj && typeof obj === 'object') {
                  if (obj.toJSON && typeof obj.toJSON === 'function') {
                    obj = obj.toJSON();
                  }
                  for (const key in obj) {
                    if (
                      Object.prototype.hasOwnProperty.call(obj, key) &&
                      _hasBinary(obj[key])
                    ) {
                      return true;
                    }
                  }
                }
                return false;
              }
              return _hasBinary(data);
            }
          }.call(
            this,
            typeof self !== 'undefined'
              ? self
              : typeof window !== 'undefined'
              ? window
              : typeof global !== 'undefined'
              ? global
              : {},
          ));
        },
        { isarray: 43 },
      ],
      42: [
        function (_dereq_, module, exports) {
          arguments[4][23][0].apply(exports, arguments);
        },
        { dup: 23 },
      ],
      43: [
        function (_dereq_, module, exports) {
          arguments[4][24][0].apply(exports, arguments);
        },
        { dup: 24 },
      ],
      44: [
        function (_dereq_, module, exports) {
          arguments[4][25][0].apply(exports, arguments);
        },
        { dup: 25 },
      ],
      45: [
        function (_dereq_, module, exports) {
          arguments[4][28][0].apply(exports, arguments);
        },
        { dup: 28 },
      ],
      46: [
        function (_dereq_, module, exports) {
          (function (global) {
            const isArray = _dereq_('isarray');
            const isBuf = _dereq_('./is-buffer');
            exports.deconstructPacket = function (packet) {
              const buffers = [];
              const packetData = packet.data;
              function _deconstructPacket(data) {
                if (!data) return data;
                if (isBuf(data)) {
                  const placeholder = {
                    _placeholder: true,
                    num: buffers.length,
                  };
                  buffers.push(data);
                  return placeholder;
                }
                if (isArray(data)) {
                  var newData = new Array(data.length);
                  for (let i = 0; i < data.length; i++) {
                    newData[i] = _deconstructPacket(data[i]);
                  }
                  return newData;
                }
                if (typeof data === 'object' && !(data instanceof Date)) {
                  var newData = {};
                  for (const key in data) {
                    newData[key] = _deconstructPacket(data[key]);
                  }
                  return newData;
                }
                return data;
              }
              const pack = packet;
              pack.data = _deconstructPacket(packetData);
              pack.attachments = buffers.length;
              return { packet: pack, buffers };
            };
            exports.reconstructPacket = function (packet, buffers) {
              const curPlaceHolder = 0;
              function _reconstructPacket(data) {
                if (data && data._placeholder) {
                  const buf = buffers[data.num];
                  return buf;
                }
                if (isArray(data)) {
                  for (let i = 0; i < data.length; i++) {
                    data[i] = _reconstructPacket(data[i]);
                  }
                  return data;
                }
                if (data && typeof data === 'object') {
                  for (const key in data) {
                    data[key] = _reconstructPacket(data[key]);
                  }
                  return data;
                }
                return data;
              }
              packet.data = _reconstructPacket(packet.data);
              packet.attachments = undefined;
              return packet;
            };
            exports.removeBlobs = function (data, callback) {
              function _removeBlobs(obj, curKey, containingObject) {
                if (!obj) return obj;
                if (
                  (global.Blob && obj instanceof Blob) ||
                  (global.File && obj instanceof File)
                ) {
                  pendingBlobs++;
                  const fileReader = new FileReader();
                  fileReader.onload = function () {
                    if (containingObject) {
                      containingObject[curKey] = this.result;
                    } else {
                      bloblessData = this.result;
                    }
                    if (!--pendingBlobs) {
                      callback(bloblessData);
                    }
                  };
                  fileReader.readAsArrayBuffer(obj);
                } else if (isArray(obj)) {
                  for (let i = 0; i < obj.length; i++) {
                    _removeBlobs(obj[i], i, obj);
                  }
                } else if (obj && typeof obj === 'object' && !isBuf(obj)) {
                  for (const key in obj) {
                    _removeBlobs(obj[key], key, obj);
                  }
                }
              }
              var pendingBlobs = 0;
              var bloblessData = data;
              _removeBlobs(bloblessData);
              if (!pendingBlobs) {
                callback(bloblessData);
              }
            };
          }.call(
            this,
            typeof self !== 'undefined'
              ? self
              : typeof window !== 'undefined'
              ? window
              : typeof global !== 'undefined'
              ? global
              : {},
          ));
        },
        { './is-buffer': 48, isarray: 43 },
      ],
      47: [
        function (_dereq_, module, exports) {
          const debug = _dereq_('debug')('socket.io-parser');
          const json = _dereq_('json3');
          const isArray = _dereq_('isarray');
          const Emitter = _dereq_('component-emitter');
          const binary = _dereq_('./binary');
          const isBuf = _dereq_('./is-buffer');
          exports.protocol = 4;
          exports.types = [
            'CONNECT',
            'DISCONNECT',
            'EVENT',
            'BINARY_EVENT',
            'ACK',
            'BINARY_ACK',
            'ERROR',
          ];
          exports.CONNECT = 0;
          exports.DISCONNECT = 1;
          exports.EVENT = 2;
          exports.ACK = 3;
          exports.ERROR = 4;
          exports.BINARY_EVENT = 5;
          exports.BINARY_ACK = 6;
          exports.Encoder = Encoder;
          exports.Decoder = Decoder;
          function Encoder() {}
          Encoder.prototype.encode = function (obj, callback) {
            debug('encoding packet %j', obj);
            if (
              exports.BINARY_EVENT == obj.type ||
              exports.BINARY_ACK == obj.type
            ) {
              encodeAsBinary(obj, callback);
            } else {
              const encoding = encodeAsString(obj);
              callback([encoding]);
            }
          };
          function encodeAsString(obj) {
            let str = '';
            let nsp = false;
            str += obj.type;
            if (
              exports.BINARY_EVENT == obj.type ||
              exports.BINARY_ACK == obj.type
            ) {
              str += obj.attachments;
              str += '-';
            }
            if (obj.nsp && obj.nsp != '/') {
              nsp = true;
              str += obj.nsp;
            }
            if (obj.id != null) {
              if (nsp) {
                str += ',';
                nsp = false;
              }
              str += obj.id;
            }
            if (obj.data != null) {
              if (nsp) str += ',';
              str += json.stringify(obj.data);
            }
            debug('encoded %j as %s', obj, str);
            return str;
          }
          function encodeAsBinary(obj, callback) {
            function writeEncoding(bloblessData) {
              const deconstruction = binary.deconstructPacket(bloblessData);
              const pack = encodeAsString(deconstruction.packet);
              const { buffers } = deconstruction;
              buffers.unshift(pack);
              callback(buffers);
            }
            binary.removeBlobs(obj, writeEncoding);
          }
          function Decoder() {
            this.reconstructor = null;
          }
          Emitter(Decoder.prototype);
          Decoder.prototype.add = function (obj) {
            let packet;
            if (typeof obj === 'string') {
              packet = decodeString(obj);
              if (
                exports.BINARY_EVENT == packet.type ||
                exports.BINARY_ACK == packet.type
              ) {
                this.reconstructor = new BinaryReconstructor(packet);
                if (this.reconstructor.reconPack.attachments === 0) {
                  this.emit('decoded', packet);
                }
              } else {
                this.emit('decoded', packet);
              }
            } else if (isBuf(obj) || obj.base64) {
              if (!this.reconstructor) {
                throw new Error(
                  'got binary data when not reconstructing a packet',
                );
              } else {
                packet = this.reconstructor.takeBinaryData(obj);
                if (packet) {
                  this.reconstructor = null;
                  this.emit('decoded', packet);
                }
              }
            } else {
              throw new Error(`Unknown type: ${obj}`);
            }
          };
          function decodeString(str) {
            const p = {};
            let i = 0;
            p.type = Number(str.charAt(0));
            if (exports.types[p.type] == null) return error();
            if (
              exports.BINARY_EVENT == p.type ||
              exports.BINARY_ACK == p.type
            ) {
              let buf = '';
              while (str.charAt(++i) != '-') {
                buf += str.charAt(i);
                if (i == str.length) break;
              }
              if (buf != Number(buf) || str.charAt(i) != '-') {
                throw new Error('Illegal attachments');
              }
              p.attachments = Number(buf);
            }
            if (str.charAt(i + 1) == '/') {
              p.nsp = '';
              while (++i) {
                var c = str.charAt(i);
                if (c == ',') break;
                p.nsp += c;
                if (i == str.length) break;
              }
            } else {
              p.nsp = '/';
            }
            const next = str.charAt(i + 1);
            if (next !== '' && Number(next) == next) {
              p.id = '';
              while (++i) {
                var c = str.charAt(i);
                if (c == null || Number(c) != c) {
                  --i;
                  break;
                }
                p.id += str.charAt(i);
                if (i == str.length) break;
              }
              p.id = Number(p.id);
            }
            if (str.charAt(++i)) {
              try {
                p.data = json.parse(str.substr(i));
              } catch (e) {
                return error();
              }
            }
            debug('decoded %s as %j', str, p);
            return p;
          }
          Decoder.prototype.destroy = function () {
            if (this.reconstructor) {
              this.reconstructor.finishedReconstruction();
            }
          };
          function BinaryReconstructor(packet) {
            this.reconPack = packet;
            this.buffers = [];
          }
          BinaryReconstructor.prototype.takeBinaryData = function (binData) {
            this.buffers.push(binData);
            if (this.buffers.length == this.reconPack.attachments) {
              const packet = binary.reconstructPacket(
                this.reconPack,
                this.buffers,
              );
              this.finishedReconstruction();
              return packet;
            }
            return null;
          };
          BinaryReconstructor.prototype.finishedReconstruction = function () {
            this.reconPack = null;
            this.buffers = [];
          };
          function error(data) {
            return { type: exports.ERROR, data: 'parser error' };
          }
        },
        {
          './binary': 46,
          './is-buffer': 48,
          'component-emitter': 49,
          debug: 39,
          isarray: 43,
          json3: 50,
        },
      ],
      48: [
        function (_dereq_, module, exports) {
          (function (global) {
            module.exports = isBuf;
            function isBuf(obj) {
              return (
                (global.Buffer && global.Buffer.isBuffer(obj)) ||
                (global.ArrayBuffer && obj instanceof ArrayBuffer)
              );
            }
          }.call(
            this,
            typeof self !== 'undefined'
              ? self
              : typeof window !== 'undefined'
              ? window
              : typeof global !== 'undefined'
              ? global
              : {},
          ));
        },
        {},
      ],
      49: [
        function (_dereq_, module, exports) {
          arguments[4][15][0].apply(exports, arguments);
        },
        { dup: 15 },
      ],
      50: [
        function (_dereq_, module, exports) {
          (function (global) {
            (function () {
              const isLoader = typeof define === 'function' && define.amd;
              const objectTypes = { function: true, object: true };
              const freeExports =
                objectTypes[typeof exports] &&
                exports &&
                !exports.nodeType &&
                exports;
              let root = (objectTypes[typeof window] && window) || this;
              const freeGlobal =
                freeExports &&
                objectTypes[typeof module] &&
                module &&
                !module.nodeType &&
                typeof global === 'object' &&
                global;
              if (
                freeGlobal &&
                (freeGlobal.global === freeGlobal ||
                  freeGlobal.window === freeGlobal ||
                  freeGlobal.self === freeGlobal)
              ) {
                root = freeGlobal;
              }
              function runInContext(context, exports) {
                context || (context = root.Object());
                exports || (exports = root.Object());
                const Number = context.Number || root.Number;
                const String = context.String || root.String;
                const Object = context.Object || root.Object;
                const Date = context.Date || root.Date;
                const SyntaxError = context.SyntaxError || root.SyntaxError;
                const TypeError = context.TypeError || root.TypeError;
                const Math = context.Math || root.Math;
                const nativeJSON = context.JSON || root.JSON;
                if (typeof nativeJSON === 'object' && nativeJSON) {
                  exports.stringify = nativeJSON.stringify;
                  exports.parse = nativeJSON.parse;
                }
                const objectProto = Object.prototype;
                const getClass = objectProto.toString;
                let isProperty;
                let forEach;
                let undef;
                let isExtended = new Date(-0xc782b5b800cec);
                try {
                  isExtended =
                    isExtended.getUTCFullYear() == -109252 &&
                    isExtended.getUTCMonth() === 0 &&
                    isExtended.getUTCDate() === 1 &&
                    isExtended.getUTCHours() == 10 &&
                    isExtended.getUTCMinutes() == 37 &&
                    isExtended.getUTCSeconds() == 6 &&
                    isExtended.getUTCMilliseconds() == 708;
                } catch (exception) {}
                function has(name) {
                  if (has[name] !== undef) {
                    return has[name];
                  }
                  let isSupported;
                  if (name == 'bug-string-char-index') {
                    isSupported = 'a'[0] != 'a';
                  } else if (name == 'json') {
                    isSupported = has('json-stringify') && has('json-parse');
                  } else {
                    let value;
                    const serialized =
                      '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
                    if (name == 'json-stringify') {
                      const { stringify } = exports;
                      let stringifySupported =
                        typeof stringify === 'function' && isExtended;
                      if (stringifySupported) {
                        (value = function () {
                          return 1;
                        }).toJSON = value;
                        try {
                          stringifySupported =
                            stringify(0) === '0' &&
                            stringify(new Number()) === '0' &&
                            stringify(new String()) == '""' &&
                            stringify(getClass) === undef &&
                            stringify(undef) === undef &&
                            stringify() === undef &&
                            stringify(value) === '1' &&
                            stringify([value]) == '[1]' &&
                            stringify([undef]) == '[null]' &&
                            stringify(null) == 'null' &&
                            stringify([undef, getClass, null]) ==
                              '[null,null,null]' &&
                            stringify({
                              a: [value, true, false, null, '\x00\b\n\f\r	'],
                            }) == serialized &&
                            stringify(null, value) === '1' &&
                            stringify([1, 2], null, 1) == '[\n 1,\n 2\n]' &&
                            stringify(new Date(-864e13)) ==
                              '"-271821-04-20T00:00:00.000Z"' &&
                            stringify(new Date(864e13)) ==
                              '"+275760-09-13T00:00:00.000Z"' &&
                            stringify(new Date(-621987552e5)) ==
                              '"-000001-01-01T00:00:00.000Z"' &&
                            stringify(new Date(-1)) ==
                              '"1969-12-31T23:59:59.999Z"';
                        } catch (exception) {
                          stringifySupported = false;
                        }
                      }
                      isSupported = stringifySupported;
                    }
                    if (name == 'json-parse') {
                      const { parse } = exports;
                      if (typeof parse === 'function') {
                        try {
                          if (parse('0') === 0 && !parse(false)) {
                            value = parse(serialized);
                            var parseSupported =
                              value.a.length == 5 && value.a[0] === 1;
                            if (parseSupported) {
                              try {
                                parseSupported = !parse('"	"');
                              } catch (exception) {}
                              if (parseSupported) {
                                try {
                                  parseSupported = parse('01') !== 1;
                                } catch (exception) {}
                              }
                              if (parseSupported) {
                                try {
                                  parseSupported = parse('1.') !== 1;
                                } catch (exception) {}
                              }
                            }
                          }
                        } catch (exception) {
                          parseSupported = false;
                        }
                      }
                      isSupported = parseSupported;
                    }
                  }
                  return (has[name] = !!isSupported);
                }
                if (!has('json')) {
                  const functionClass = '[object Function]';
                  const dateClass = '[object Date]';
                  const numberClass = '[object Number]';
                  const stringClass = '[object String]';
                  const arrayClass = '[object Array]';
                  const booleanClass = '[object Boolean]';
                  const charIndexBuggy = has('bug-string-char-index');
                  if (!isExtended) {
                    var { floor } = Math;
                    const Months = [
                      0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334,
                    ];
                    var getDay = function (year, month) {
                      return (
                        Months[month] +
                        365 * (year - 1970) +
                        floor((year - 1969 + (month = +(month > 1))) / 4) -
                        floor((year - 1901 + month) / 100) +
                        floor((year - 1601 + month) / 400)
                      );
                    };
                  }
                  if (!(isProperty = objectProto.hasOwnProperty)) {
                    isProperty = function (property) {
                      let members = {};
                      let constructor;
                      if (
                        ((members.__proto__ = null),
                        (members.__proto__ = { toString: 1 }),
                        members).toString != getClass
                      ) {
                        isProperty = function (property) {
                          const original = this.__proto__;
                          const result =
                            property in ((this.__proto__ = null), this);
                          this.__proto__ = original;
                          return result;
                        };
                      } else {
                        constructor = members.constructor;
                        isProperty = function (property) {
                          const parent = (this.constructor || constructor)
                            .prototype;
                          return (
                            property in this &&
                            !(
                              property in parent &&
                              this[property] === parent[property]
                            )
                          );
                        };
                      }
                      members = null;
                      return isProperty.call(this, property);
                    };
                  }
                  forEach = function (object, callback) {
                    let size = 0;
                    let Properties;
                    let members;
                    let property;
                    (Properties = function () {
                      this.valueOf = 0;
                    }).prototype.valueOf = 0;
                    members = new Properties();
                    for (property in members) {
                      if (isProperty.call(members, property)) {
                        size++;
                      }
                    }
                    Properties = members = null;
                    if (!size) {
                      members = [
                        'valueOf',
                        'toString',
                        'toLocaleString',
                        'propertyIsEnumerable',
                        'isPrototypeOf',
                        'hasOwnProperty',
                        'constructor',
                      ];
                      forEach = function (object, callback) {
                        const isFunction =
                          getClass.call(object) == functionClass;
                        let property;
                        let length;
                        const hasProperty =
                          (!isFunction &&
                            typeof object.constructor !== 'function' &&
                            objectTypes[typeof object.hasOwnProperty] &&
                            object.hasOwnProperty) ||
                          isProperty;
                        for (property in object) {
                          if (
                            !(isFunction && property == 'prototype') &&
                            hasProperty.call(object, property)
                          ) {
                            callback(property);
                          }
                        }
                        for (
                          length = members.length;
                          (property = members[--length]);
                          hasProperty.call(object, property) &&
                          callback(property)
                        );
                      };
                    } else if (size == 2) {
                      forEach = function (object, callback) {
                        const members = {};
                        const isFunction =
                          getClass.call(object) == functionClass;
                        let property;
                        for (property in object) {
                          if (
                            !(isFunction && property == 'prototype') &&
                            !isProperty.call(members, property) &&
                            (members[property] = 1) &&
                            isProperty.call(object, property)
                          ) {
                            callback(property);
                          }
                        }
                      };
                    } else {
                      forEach = function (object, callback) {
                        const isFunction =
                          getClass.call(object) == functionClass;
                        let property;
                        let isConstructor;
                        for (property in object) {
                          if (
                            !(isFunction && property == 'prototype') &&
                            isProperty.call(object, property) &&
                            !(isConstructor = property === 'constructor')
                          ) {
                            callback(property);
                          }
                        }
                        if (
                          isConstructor ||
                          isProperty.call(object, (property = 'constructor'))
                        ) {
                          callback(property);
                        }
                      };
                    }
                    return forEach(object, callback);
                  };
                  if (!has('json-stringify')) {
                    const Escapes = {
                      92: '\\\\',
                      34: '\\"',
                      8: '\\b',
                      12: '\\f',
                      10: '\\n',
                      13: '\\r',
                      9: '\\t',
                    };
                    const leadingZeroes = '000000';
                    const toPaddedString = function (width, value) {
                      return (leadingZeroes + (value || 0)).slice(-width);
                    };
                    const unicodePrefix = '\\u00';
                    const quote = function (value) {
                      let result = '"';
                      let index = 0;
                      const { length } = value;
                      const useCharIndex = !charIndexBuggy || length > 10;
                      const symbols =
                        useCharIndex &&
                        (charIndexBuggy ? value.split('') : value);
                      for (; index < length; index++) {
                        const charCode = value.charCodeAt(index);
                        switch (charCode) {
                          case 8:
                          case 9:
                          case 10:
                          case 12:
                          case 13:
                          case 34:
                          case 92:
                            result += Escapes[charCode];
                            break;
                          default:
                            if (charCode < 32) {
                              result +=
                                unicodePrefix +
                                toPaddedString(2, charCode.toString(16));
                              break;
                            }
                            result += useCharIndex
                              ? symbols[index]
                              : value.charAt(index);
                        }
                      }
                      return `${result}"`;
                    };
                    var serialize = function (
                      property,
                      object,
                      callback,
                      properties,
                      whitespace,
                      indentation,
                      stack,
                    ) {
                      let value;
                      let className;
                      let year;
                      let month;
                      let date;
                      let time;
                      let hours;
                      let minutes;
                      let seconds;
                      let milliseconds;
                      let results;
                      let element;
                      let index;
                      let length;
                      let prefix;
                      let result;
                      try {
                        value = object[property];
                      } catch (exception) {}
                      if (typeof value === 'object' && value) {
                        className = getClass.call(value);
                        if (
                          className == dateClass &&
                          !isProperty.call(value, 'toJSON')
                        ) {
                          if (value > -1 / 0 && value < 1 / 0) {
                            if (getDay) {
                              date = floor(value / 864e5);
                              for (
                                year = floor(date / 365.2425) + 1970 - 1;
                                getDay(year + 1, 0) <= date;
                                year++
                              );
                              for (
                                month = floor((date - getDay(year, 0)) / 30.42);
                                getDay(year, month + 1) <= date;
                                month++
                              );
                              date = 1 + date - getDay(year, month);
                              time = ((value % 864e5) + 864e5) % 864e5;
                              hours = floor(time / 36e5) % 24;
                              minutes = floor(time / 6e4) % 60;
                              seconds = floor(time / 1e3) % 60;
                              milliseconds = time % 1e3;
                            } else {
                              year = value.getUTCFullYear();
                              month = value.getUTCMonth();
                              date = value.getUTCDate();
                              hours = value.getUTCHours();
                              minutes = value.getUTCMinutes();
                              seconds = value.getUTCSeconds();
                              milliseconds = value.getUTCMilliseconds();
                            }
                            value = `${
                              year <= 0 || year >= 1e4
                                ? (year < 0 ? '-' : '+') +
                                  toPaddedString(6, year < 0 ? -year : year)
                                : toPaddedString(4, year)
                            }-${toPaddedString(2, month + 1)}-${toPaddedString(
                              2,
                              date,
                            )}T${toPaddedString(2, hours)}:${toPaddedString(
                              2,
                              minutes,
                            )}:${toPaddedString(2, seconds)}.${toPaddedString(
                              3,
                              milliseconds,
                            )}Z`;
                          } else {
                            value = null;
                          }
                        } else if (
                          typeof value.toJSON === 'function' &&
                          ((className != numberClass &&
                            className != stringClass &&
                            className != arrayClass) ||
                            isProperty.call(value, 'toJSON'))
                        ) {
                          value = value.toJSON(property);
                        }
                      }
                      if (callback) {
                        value = callback.call(object, property, value);
                      }
                      if (value === null) {
                        return 'null';
                      }
                      className = getClass.call(value);
                      if (className == booleanClass) {
                        return `${value}`;
                      }
                      if (className == numberClass) {
                        return value > -1 / 0 && value < 1 / 0
                          ? `${value}`
                          : 'null';
                      }
                      if (className == stringClass) {
                        return quote(`${value}`);
                      }
                      if (typeof value === 'object') {
                        for (length = stack.length; length--; ) {
                          if (stack[length] === value) {
                            throw TypeError();
                          }
                        }
                        stack.push(value);
                        results = [];
                        prefix = indentation;
                        indentation += whitespace;
                        if (className == arrayClass) {
                          for (
                            index = 0, length = value.length;
                            index < length;
                            index++
                          ) {
                            element = serialize(
                              index,
                              value,
                              callback,
                              properties,
                              whitespace,
                              indentation,
                              stack,
                            );
                            results.push(element === undef ? 'null' : element);
                          }
                          result = results.length
                            ? whitespace
                              ? `[\n${indentation}${results.join(
                                  `,\n${indentation}`,
                                )}\n${prefix}]`
                              : `[${results.join(',')}]`
                            : '[]';
                        } else {
                          forEach(properties || value, (property) => {
                            const element = serialize(
                              property,
                              value,
                              callback,
                              properties,
                              whitespace,
                              indentation,
                              stack,
                            );
                            if (element !== undef) {
                              results.push(
                                `${quote(property)}:${
                                  whitespace ? ' ' : ''
                                }${element}`,
                              );
                            }
                          });
                          result = results.length
                            ? whitespace
                              ? `{\n${indentation}${results.join(
                                  `,\n${indentation}`,
                                )}\n${prefix}}`
                              : `{${results.join(',')}}`
                            : '{}';
                        }
                        stack.pop();
                        return result;
                      }
                    };
                    exports.stringify = function (source, filter, width) {
                      let whitespace;
                      let callback;
                      let properties;
                      let className;
                      if (objectTypes[typeof filter] && filter) {
                        if (
                          (className = getClass.call(filter)) == functionClass
                        ) {
                          callback = filter;
                        } else if (className == arrayClass) {
                          properties = {};
                          for (
                            var index = 0, { length } = filter, value;
                            index < length;
                            value = filter[index++],
                              ((className = getClass.call(value)),
                              className == stringClass ||
                                className == numberClass) &&
                                (properties[value] = 1)
                          );
                        }
                      }
                      if (width) {
                        if ((className = getClass.call(width)) == numberClass) {
                          if ((width -= width % 1) > 0) {
                            for (
                              whitespace = '', width > 10 && (width = 10);
                              whitespace.length < width;
                              whitespace += ' '
                            );
                          }
                        } else if (className == stringClass) {
                          whitespace =
                            width.length <= 10 ? width : width.slice(0, 10);
                        }
                      }
                      return serialize(
                        '',
                        ((value = {}), (value[''] = source), value),
                        callback,
                        properties,
                        whitespace,
                        '',
                        [],
                      );
                    };
                  }
                  if (!has('json-parse')) {
                    const { fromCharCode } = String;
                    const Unescapes = {
                      92: '\\',
                      34: '"',
                      47: '/',
                      98: '\b',
                      116: '	',
                      110: '\n',
                      102: '\f',
                      114: '\r',
                    };
                    let Index;
                    let Source;
                    const abort = function () {
                      Index = Source = null;
                      throw SyntaxError();
                    };
                    const lex = function () {
                      const source = Source;
                      const { length } = source;
                      let value;
                      let begin;
                      let position;
                      let isSigned;
                      let charCode;
                      while (Index < length) {
                        charCode = source.charCodeAt(Index);
                        switch (charCode) {
                          case 9:
                          case 10:
                          case 13:
                          case 32:
                            Index++;
                            break;
                          case 123:
                          case 125:
                          case 91:
                          case 93:
                          case 58:
                          case 44:
                            value = charIndexBuggy
                              ? source.charAt(Index)
                              : source[Index];
                            Index++;
                            return value;
                          case 34:
                            for (value = '@', Index++; Index < length; ) {
                              charCode = source.charCodeAt(Index);
                              if (charCode < 32) {
                                abort();
                              } else if (charCode == 92) {
                                charCode = source.charCodeAt(++Index);
                                switch (charCode) {
                                  case 92:
                                  case 34:
                                  case 47:
                                  case 98:
                                  case 116:
                                  case 110:
                                  case 102:
                                  case 114:
                                    value += Unescapes[charCode];
                                    Index++;
                                    break;
                                  case 117:
                                    begin = ++Index;
                                    for (
                                      position = Index + 4;
                                      Index < position;
                                      Index++
                                    ) {
                                      charCode = source.charCodeAt(Index);
                                      if (
                                        !(
                                          (charCode >= 48 && charCode <= 57) ||
                                          (charCode >= 97 && charCode <= 102) ||
                                          (charCode >= 65 && charCode <= 70)
                                        )
                                      ) {
                                        abort();
                                      }
                                    }
                                    value += fromCharCode(
                                      `0x${source.slice(begin, Index)}`,
                                    );
                                    break;
                                  default:
                                    abort();
                                }
                              } else {
                                if (charCode == 34) {
                                  break;
                                }
                                charCode = source.charCodeAt(Index);
                                begin = Index;
                                while (
                                  charCode >= 32 &&
                                  charCode != 92 &&
                                  charCode != 34
                                ) {
                                  charCode = source.charCodeAt(++Index);
                                }
                                value += source.slice(begin, Index);
                              }
                            }
                            if (source.charCodeAt(Index) == 34) {
                              Index++;
                              return value;
                            }
                            abort();
                          default:
                            begin = Index;
                            if (charCode == 45) {
                              isSigned = true;
                              charCode = source.charCodeAt(++Index);
                            }
                            if (charCode >= 48 && charCode <= 57) {
                              if (
                                charCode == 48 &&
                                ((charCode = source.charCodeAt(Index + 1)),
                                charCode >= 48 && charCode <= 57)
                              ) {
                                abort();
                              }
                              isSigned = false;
                              for (
                                ;
                                Index < length &&
                                ((charCode = source.charCodeAt(Index)),
                                charCode >= 48 && charCode <= 57);
                                Index++
                              );
                              if (source.charCodeAt(Index) == 46) {
                                position = ++Index;
                                for (
                                  ;
                                  position < length &&
                                  ((charCode = source.charCodeAt(position)),
                                  charCode >= 48 && charCode <= 57);
                                  position++
                                );
                                if (position == Index) {
                                  abort();
                                }
                                Index = position;
                              }
                              charCode = source.charCodeAt(Index);
                              if (charCode == 101 || charCode == 69) {
                                charCode = source.charCodeAt(++Index);
                                if (charCode == 43 || charCode == 45) {
                                  Index++;
                                }
                                for (
                                  position = Index;
                                  position < length &&
                                  ((charCode = source.charCodeAt(position)),
                                  charCode >= 48 && charCode <= 57);
                                  position++
                                );
                                if (position == Index) {
                                  abort();
                                }
                                Index = position;
                              }
                              return +source.slice(begin, Index);
                            }
                            if (isSigned) {
                              abort();
                            }
                            if (source.slice(Index, Index + 4) == 'true') {
                              Index += 4;
                              return true;
                            }
                            if (source.slice(Index, Index + 5) == 'false') {
                              Index += 5;
                              return false;
                            }
                            if (source.slice(Index, Index + 4) == 'null') {
                              Index += 4;
                              return null;
                            }
                            abort();
                        }
                      }
                      return '$';
                    };
                    var get = function (value) {
                      let results;
                      let hasMembers;
                      if (value == '$') {
                        abort();
                      }
                      if (typeof value === 'string') {
                        if (
                          (charIndexBuggy ? value.charAt(0) : value[0]) == '@'
                        ) {
                          return value.slice(1);
                        }
                        if (value == '[') {
                          results = [];
                          for (; ; hasMembers || (hasMembers = true)) {
                            value = lex();
                            if (value == ']') {
                              break;
                            }
                            if (hasMembers) {
                              if (value == ',') {
                                value = lex();
                                if (value == ']') {
                                  abort();
                                }
                              } else {
                                abort();
                              }
                            }
                            if (value == ',') {
                              abort();
                            }
                            results.push(get(value));
                          }
                          return results;
                        }
                        if (value == '{') {
                          results = {};
                          for (; ; hasMembers || (hasMembers = true)) {
                            value = lex();
                            if (value == '}') {
                              break;
                            }
                            if (hasMembers) {
                              if (value == ',') {
                                value = lex();
                                if (value == '}') {
                                  abort();
                                }
                              } else {
                                abort();
                              }
                            }
                            if (
                              value == ',' ||
                              typeof value !== 'string' ||
                              (charIndexBuggy ? value.charAt(0) : value[0]) !=
                                '@' ||
                              lex() != ':'
                            ) {
                              abort();
                            }
                            results[value.slice(1)] = get(lex());
                          }
                          return results;
                        }
                        abort();
                      }
                      return value;
                    };
                    const update = function (source, property, callback) {
                      const element = walk(source, property, callback);
                      if (element === undef) {
                        delete source[property];
                      } else {
                        source[property] = element;
                      }
                    };
                    var walk = function (source, property, callback) {
                      const value = source[property];
                      let length;
                      if (typeof value === 'object' && value) {
                        if (getClass.call(value) == arrayClass) {
                          for (length = value.length; length--; ) {
                            update(value, length, callback);
                          }
                        } else {
                          forEach(value, (property) => {
                            update(value, property, callback);
                          });
                        }
                      }
                      return callback.call(source, property, value);
                    };
                    exports.parse = function (source, callback) {
                      let result;
                      let value;
                      Index = 0;
                      Source = `${source}`;
                      result = get(lex());
                      if (lex() != '$') {
                        abort();
                      }
                      Index = Source = null;
                      return callback &&
                        getClass.call(callback) == functionClass
                        ? walk(
                            ((value = {}), (value[''] = result), value),
                            '',
                            callback,
                          )
                        : result;
                    };
                  }
                }
                exports.runInContext = runInContext;
                return exports;
              }
              if (freeExports && !isLoader) {
                runInContext(root, freeExports);
              } else {
                let nativeJSON = root.JSON;
                let previousJSON = root.JSON3;
                let isRestored = false;
                var JSON3 = runInContext(
                  root,
                  (root.JSON3 = {
                    noConflict() {
                      if (!isRestored) {
                        isRestored = true;
                        root.JSON = nativeJSON;
                        root.JSON3 = previousJSON;
                        nativeJSON = previousJSON = null;
                      }
                      return JSON3;
                    },
                  }),
                );
                root.JSON = { parse: JSON3.parse, stringify: JSON3.stringify };
              }
              if (isLoader) {
                define(() => JSON3);
              }
            }.call(this));
          }.call(
            this,
            typeof self !== 'undefined'
              ? self
              : typeof window !== 'undefined'
              ? window
              : typeof global !== 'undefined'
              ? global
              : {},
          ));
        },
        {},
      ],
      51: [
        function (_dereq_, module, exports) {
          module.exports = toArray;
          function toArray(list, index) {
            const array = [];
            index = index || 0;
            for (let i = index || 0; i < list.length; i++) {
              array[i - index] = list[i];
            }
            return array;
          }
        },
        {},
      ],
    },
    {},
    [31],
  )(31);
});
