
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(anchor = null) {
            this.a = anchor;
            this.e = this.n = null;
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.h(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const LOCATION = {};
    const ROUTER = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    function getLocation(source) {
      return {
        ...source.location,
        state: source.history.state,
        key: (source.history.state && source.history.state.key) || "initial"
      };
    }

    function createHistory(source, options) {
      const listeners = [];
      let location = getLocation(source);

      return {
        get location() {
          return location;
        },

        listen(listener) {
          listeners.push(listener);

          const popstateListener = () => {
            location = getLocation(source);
            listener({ location, action: "POP" });
          };

          source.addEventListener("popstate", popstateListener);

          return () => {
            source.removeEventListener("popstate", popstateListener);

            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
          };
        },

        navigate(to, { state, replace = false } = {}) {
          state = { ...state, key: Date.now() + "" };
          // try...catch iOS Safari limits to 100 pushState calls
          try {
            if (replace) {
              source.history.replaceState(state, null, to);
            } else {
              source.history.pushState(state, null, to);
            }
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }

          location = getLocation(source);
          listeners.forEach(listener => listener({ location, action: "PUSH" }));
        }
      };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
      let index = 0;
      const stack = [{ pathname: initialPathname, search: "" }];
      const states = [];

      return {
        get location() {
          return stack[index];
        },
        addEventListener(name, fn) {},
        removeEventListener(name, fn) {},
        history: {
          get entries() {
            return stack;
          },
          get index() {
            return index;
          },
          get state() {
            return states[index];
          },
          pushState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            index++;
            stack.push({ pathname, search });
            states.push(state);
          },
          replaceState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            stack[index] = { pathname, search };
            states[index] = state;
          }
        }
      };
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = Boolean(
      typeof window !== "undefined" &&
        window.document &&
        window.document.createElement
    );
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
    const { navigate } = globalHistory;

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    const paramRe = /^:(.+)/;

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Check if `string` starts with `search`
     * @param {string} string
     * @param {string} search
     * @return {boolean}
     */
    function startsWith(string, search) {
      return string.substr(0, search.length) === search;
    }

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    function isRootSegment(segment) {
      return segment === "";
    }

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    function isDynamic(segment) {
      return paramRe.test(segment);
    }

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    function isSplat(segment) {
      return segment[0] === "*";
    }

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri) {
      return (
        uri
          // Strip starting/ending `/`
          .replace(/(^\/+|\/+$)/g, "")
          .split("/")
      );
    }

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    function stripSlashes(str) {
      return str.replace(/(^\/+|\/+$)/g, "");
    }

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
      const score = route.default
        ? 0
        : segmentize(route.path).reduce((score, segment) => {
            score += SEGMENT_POINTS;

            if (isRootSegment(segment)) {
              score += ROOT_POINTS;
            } else if (isDynamic(segment)) {
              score += DYNAMIC_POINTS;
            } else if (isSplat(segment)) {
              score -= SEGMENT_POINTS + SPLAT_PENALTY;
            } else {
              score += STATIC_POINTS;
            }

            return score;
          }, 0);

      return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
      return (
        routes
          .map(rankRoute)
          // If two routes have the exact same score, we go by index instead
          .sort((a, b) =>
            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
          )
      );
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
      let match;
      let default_;

      const [uriPathname] = uri.split("?");
      const uriSegments = segmentize(uriPathname);
      const isRootUri = uriSegments[0] === "";
      const ranked = rankRoutes(routes);

      for (let i = 0, l = ranked.length; i < l; i++) {
        const route = ranked[i].route;
        let missed = false;

        if (route.default) {
          default_ = {
            route,
            params: {},
            uri
          };
          continue;
        }

        const routeSegments = segmentize(route.path);
        const params = {};
        const max = Math.max(uriSegments.length, routeSegments.length);
        let index = 0;

        for (; index < max; index++) {
          const routeSegment = routeSegments[index];
          const uriSegment = uriSegments[index];

          if (routeSegment !== undefined && isSplat(routeSegment)) {
            // Hit a splat, just grab the rest, and return a match
            // uri:   /files/documents/work
            // route: /files/* or /files/*splatname
            const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

            params[splatName] = uriSegments
              .slice(index)
              .map(decodeURIComponent)
              .join("/");
            break;
          }

          if (uriSegment === undefined) {
            // URI is shorter than the route, no match
            // uri:   /users
            // route: /users/:userId
            missed = true;
            break;
          }

          let dynamicMatch = paramRe.exec(routeSegment);

          if (dynamicMatch && !isRootUri) {
            const value = decodeURIComponent(uriSegment);
            params[dynamicMatch[1]] = value;
          } else if (routeSegment !== uriSegment) {
            // Current segments don't match, not dynamic, not splat, so no match
            // uri:   /users/123/settings
            // route: /users/:id/profile
            missed = true;
            break;
          }
        }

        if (!missed) {
          match = {
            route,
            params,
            uri: "/" + uriSegments.slice(0, index).join("/")
          };
          break;
        }
      }

      return match || default_ || null;
    }

    /**
     * Check if the `path` matches the `uri`.
     * @param {string} path
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
      return pick([route], uri);
    }

    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    function addQuery(pathname, query) {
      return pathname + (query ? `?${query}` : "");
    }

    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    function resolve(to, base) {
      // /foo/bar, /baz/qux => /foo/bar
      if (startsWith(to, "/")) {
        return to;
      }

      const [toPathname, toQuery] = to.split("?");
      const [basePathname] = base.split("?");
      const toSegments = segmentize(toPathname);
      const baseSegments = segmentize(basePathname);

      // ?a=b, /users?b=c => /users?a=b
      if (toSegments[0] === "") {
        return addQuery(basePathname, toQuery);
      }

      // profile, /users/789 => /users/789/profile
      if (!startsWith(toSegments[0], ".")) {
        const pathname = baseSegments.concat(toSegments).join("/");

        return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
      }

      // ./       , /users/123 => /users/123
      // ../      , /users/123 => /users
      // ../..    , /users/123 => /
      // ../../one, /a/b/c/d   => /a/b/one
      // .././one , /a/b/c/d   => /a/b/c/one
      const allSegments = baseSegments.concat(toSegments);
      const segments = [];

      allSegments.forEach(segment => {
        if (segment === "..") {
          segments.pop();
        } else if (segment !== ".") {
          segments.push(segment);
        }
      });

      return addQuery("/" + segments.join("/"), toQuery);
    }

    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    function combinePaths(basepath, path) {
      return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
    }

    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    function shouldNavigate(event) {
      return (
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
      );
    }

    function hostMatches(anchor) {
      const host = location.host;
      return (
        anchor.host == host ||
        // svelte seems to kill anchor.host value in ie11, so fall back to checking href
        anchor.href.indexOf(`https://${host}`) === 0 ||
        anchor.href.indexOf(`http://${host}`) === 0
      )
    }

    /* node_modules/svelte-routing/src/Router.svelte generated by Svelte v3.38.2 */

    function create_fragment$h(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 256)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let $base;
    	let $location;
    	let $routes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Router", slots, ['default']);
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	validate_store(routes, "routes");
    	component_subscribe($$self, routes, value => $$invalidate(7, $routes = value));
    	const activeRoute = writable(null);
    	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    	// If locationContext is not set, this is the topmost Router in the tree.
    	// If the `url` prop is given we force the location to it.
    	const location = locationContext || writable(url ? { pathname: url } : globalHistory.location);

    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(6, $location = value));

    	// If routerContext is set, the routerBase of the parent Router
    	// will be the base for this Router's descendants.
    	// If routerContext is not set, the path and resolved uri will both
    	// have the value of the basepath prop.
    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	validate_store(base, "base");
    	component_subscribe($$self, base, value => $$invalidate(5, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		// If there is no activeRoute, the routerBase will be identical to the base.
    		if (activeRoute === null) {
    			return base;
    		}

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		// Remove the potential /* or /*splatname from
    		// the end of the child Routes relative paths.
    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	function registerRoute(route) {
    		const { path: basepath } = $base;
    		let { path } = route;

    		// We store the original path in the _path property so we can reuse
    		// it when the basepath changes. The only thing that matters is that
    		// the route reference is intact, so mutation is fine.
    		route._path = path;

    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) {
    				return;
    			}

    			const matchingRoute = match(route, $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => {
    				rs.push(route);
    				return rs;
    			});
    		}
    	}

    	function unregisterRoute(route) {
    		routes.update(rs => {
    			const index = rs.indexOf(route);
    			rs.splice(index, 1);
    			return rs;
    		});
    	}

    	if (!locationContext) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = globalHistory.listen(history => {
    				location.set(history.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	const writable_props = ["basepath", "url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		onMount,
    		writable,
    		derived,
    		LOCATION,
    		ROUTER,
    		globalHistory,
    		pick,
    		match,
    		stripSlashes,
    		combinePaths,
    		basepath,
    		url,
    		locationContext,
    		routerContext,
    		routes,
    		activeRoute,
    		hasActiveRoute,
    		location,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute,
    		$base,
    		$location,
    		$routes
    	});

    	$$self.$inject_state = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("hasActiveRoute" in $$props) hasActiveRoute = $$props.hasActiveRoute;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$base*/ 32) {
    			// This reactive statement will update all the Routes' path when
    			// the basepath changes.
    			{
    				const { path: basepath } = $base;

    				routes.update(rs => {
    					rs.forEach(r => r.path = combinePaths(basepath, r._path));
    					return rs;
    				});
    			}
    		}

    		if ($$self.$$.dirty & /*$routes, $location*/ 192) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			{
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch);
    			}
    		}
    	};

    	return [
    		routes,
    		location,
    		base,
    		basepath,
    		url,
    		$base,
    		$location,
    		$routes,
    		$$scope,
    		slots
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { basepath: 3, url: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$h.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Route.svelte generated by Svelte v3.38.2 */

    const get_default_slot_changes = dirty => ({
    	params: dirty & /*routeParams*/ 4,
    	location: dirty & /*$location*/ 16
    });

    const get_default_slot_context = ctx => ({
    	params: /*routeParams*/ ctx[2],
    	location: /*$location*/ ctx[4]
    });

    // (40:0) {#if $activeRoute !== null && $activeRoute.route === route}
    function create_if_block$6(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$5, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0] !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(40:0) {#if $activeRoute !== null && $activeRoute.route === route}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {:else}
    function create_else_block$3(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, routeParams, $location*/ 532)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[9], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(43:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:2) {#if component !== null}
    function create_if_block_1$5(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ location: /*$location*/ ctx[4] },
    		/*routeParams*/ ctx[2],
    		/*routeProps*/ ctx[3]
    	];

    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$location, routeParams, routeProps*/ 28)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*$location*/ 16 && { location: /*$location*/ ctx[4] },
    					dirty & /*routeParams*/ 4 && get_spread_object(/*routeParams*/ ctx[2]),
    					dirty & /*routeProps*/ 8 && get_spread_object(/*routeProps*/ ctx[3])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(41:2) {#if component !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Route", slots, ['default']);
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	validate_store(activeRoute, "activeRoute");
    	component_subscribe($$self, activeRoute, value => $$invalidate(1, $activeRoute = value));
    	const location = getContext(LOCATION);
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(4, $location = value));

    	const route = {
    		path,
    		// If no path prop is given, this Route will act as the default Route
    		// that is rendered if no other Route in the Router is a match.
    		default: path === ""
    	};

    	let routeParams = {};
    	let routeProps = {};
    	registerRoute(route);

    	// There is no need to unregister Routes in SSR since it will all be
    	// thrown away anyway.
    	if (typeof window !== "undefined") {
    		onDestroy(() => {
    			unregisterRoute(route);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("path" in $$new_props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ("$$scope" in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onDestroy,
    		ROUTER,
    		LOCATION,
    		path,
    		component,
    		registerRoute,
    		unregisterRoute,
    		activeRoute,
    		location,
    		route,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), $$new_props));
    		if ("path" in $$props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$props) $$invalidate(0, component = $$new_props.component);
    		if ("routeParams" in $$props) $$invalidate(2, routeParams = $$new_props.routeParams);
    		if ("routeProps" in $$props) $$invalidate(3, routeProps = $$new_props.routeProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$activeRoute*/ 2) {
    			if ($activeRoute && $activeRoute.route === route) {
    				$$invalidate(2, routeParams = $activeRoute.params);
    			}
    		}

    		{
    			const { path, component, ...rest } = $$props;
    			$$invalidate(3, routeProps = rest);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		$activeRoute,
    		routeParams,
    		routeProps,
    		$location,
    		activeRoute,
    		location,
    		route,
    		path,
    		$$scope,
    		slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { path: 8, component: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$g.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Link.svelte generated by Svelte v3.38.2 */
    const file$f = "node_modules/svelte-routing/src/Link.svelte";

    function create_fragment$f(ctx) {
    	let a;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[16].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], null);

    	let a_levels = [
    		{ href: /*href*/ ctx[0] },
    		{ "aria-current": /*ariaCurrent*/ ctx[2] },
    		/*props*/ ctx[1],
    		/*$$restProps*/ ctx[6]
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			set_attributes(a, a_data);
    			add_location(a, file$f, 40, 0, 1249);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*onClick*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32768)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[15], dirty, null, null);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*href*/ 1) && { href: /*href*/ ctx[0] },
    				(!current || dirty & /*ariaCurrent*/ 4) && { "aria-current": /*ariaCurrent*/ ctx[2] },
    				dirty & /*props*/ 2 && /*props*/ ctx[1],
    				dirty & /*$$restProps*/ 64 && /*$$restProps*/ ctx[6]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let ariaCurrent;
    	const omit_props_names = ["to","replace","state","getProps"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $base;
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Link", slots, ['default']);
    	let { to = "#" } = $$props;
    	let { replace = false } = $$props;
    	let { state = {} } = $$props;
    	let { getProps = () => ({}) } = $$props;
    	const { base } = getContext(ROUTER);
    	validate_store(base, "base");
    	component_subscribe($$self, base, value => $$invalidate(13, $base = value));
    	const location = getContext(LOCATION);
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(14, $location = value));
    	const dispatch = createEventDispatcher();
    	let href, isPartiallyCurrent, isCurrent, props;

    	function onClick(event) {
    		dispatch("click", event);

    		if (shouldNavigate(event)) {
    			event.preventDefault();

    			// Don't push another entry to the history stack when the user
    			// clicks on a Link to the page they are currently on.
    			const shouldReplace = $location.pathname === href || replace;

    			navigate(href, { state, replace: shouldReplace });
    		}
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(6, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("to" in $$new_props) $$invalidate(7, to = $$new_props.to);
    		if ("replace" in $$new_props) $$invalidate(8, replace = $$new_props.replace);
    		if ("state" in $$new_props) $$invalidate(9, state = $$new_props.state);
    		if ("getProps" in $$new_props) $$invalidate(10, getProps = $$new_props.getProps);
    		if ("$$scope" in $$new_props) $$invalidate(15, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		createEventDispatcher,
    		ROUTER,
    		LOCATION,
    		navigate,
    		startsWith,
    		resolve,
    		shouldNavigate,
    		to,
    		replace,
    		state,
    		getProps,
    		base,
    		location,
    		dispatch,
    		href,
    		isPartiallyCurrent,
    		isCurrent,
    		props,
    		onClick,
    		$base,
    		$location,
    		ariaCurrent
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("to" in $$props) $$invalidate(7, to = $$new_props.to);
    		if ("replace" in $$props) $$invalidate(8, replace = $$new_props.replace);
    		if ("state" in $$props) $$invalidate(9, state = $$new_props.state);
    		if ("getProps" in $$props) $$invalidate(10, getProps = $$new_props.getProps);
    		if ("href" in $$props) $$invalidate(0, href = $$new_props.href);
    		if ("isPartiallyCurrent" in $$props) $$invalidate(11, isPartiallyCurrent = $$new_props.isPartiallyCurrent);
    		if ("isCurrent" in $$props) $$invalidate(12, isCurrent = $$new_props.isCurrent);
    		if ("props" in $$props) $$invalidate(1, props = $$new_props.props);
    		if ("ariaCurrent" in $$props) $$invalidate(2, ariaCurrent = $$new_props.ariaCurrent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*to, $base*/ 8320) {
    			$$invalidate(0, href = to === "/" ? $base.uri : resolve(to, $base.uri));
    		}

    		if ($$self.$$.dirty & /*$location, href*/ 16385) {
    			$$invalidate(11, isPartiallyCurrent = startsWith($location.pathname, href));
    		}

    		if ($$self.$$.dirty & /*href, $location*/ 16385) {
    			$$invalidate(12, isCurrent = href === $location.pathname);
    		}

    		if ($$self.$$.dirty & /*isCurrent*/ 4096) {
    			$$invalidate(2, ariaCurrent = isCurrent ? "page" : undefined);
    		}

    		if ($$self.$$.dirty & /*getProps, $location, href, isPartiallyCurrent, isCurrent*/ 23553) {
    			$$invalidate(1, props = getProps({
    				location: $location,
    				href,
    				isPartiallyCurrent,
    				isCurrent
    			}));
    		}
    	};

    	return [
    		href,
    		props,
    		ariaCurrent,
    		base,
    		location,
    		onClick,
    		$$restProps,
    		to,
    		replace,
    		state,
    		getProps,
    		isPartiallyCurrent,
    		isCurrent,
    		$base,
    		$location,
    		$$scope,
    		slots
    	];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {
    			to: 7,
    			replace: 8,
    			state: 9,
    			getProps: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get to() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getProps() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getProps(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * An action to be added at a root element of your application to
     * capture all relative links and push them onto the history stack.
     *
     * Example:
     * ```html
     * <div use:links>
     *   <Router>
     *     <Route path="/" component={Home} />
     *     <Route path="/p/:projectId/:docId?" component={ProjectScreen} />
     *     {#each projects as project}
     *       <a href="/p/{project.id}">{project.title}</a>
     *     {/each}
     *   </Router>
     * </div>
     * ```
     */
    function links(node) {
      function findClosest(tagName, el) {
        while (el && el.tagName !== tagName) {
          el = el.parentNode;
        }
        return el;
      }

      function onClick(event) {
        const anchor = findClosest("A", event.target);

        if (
          anchor &&
          anchor.target === "" &&
          hostMatches(anchor) &&
          shouldNavigate(event) &&
          !anchor.hasAttribute("noroute")
        ) {
          event.preventDefault();
          navigate(anchor.pathname + anchor.search, { replace: anchor.hasAttribute("replace") });
        }
      }

      node.addEventListener("click", onClick);

      return {
        destroy() {
          node.removeEventListener("click", onClick);
        }
      };
    }

    /* src/components/Navbar.svelte generated by Svelte v3.38.2 */
    const file$e = "src/components/Navbar.svelte";

    // (13:16) <Link to="/" class="block py-1  pl-1  text-gray-600 no-underline hover:text-red-600">
    function create_default_slot_2$1(ctx) {
    	let i;
    	let t0;
    	let span;

    	const block = {
    		c: function create() {
    			i = element("i");
    			t0 = space();
    			span = element("span");
    			span.textContent = "Inicio";
    			attr_dev(i, "class", "bi bi-house iconMenu svelte-1euneyh");
    			add_location(i, file$e, 13, 20, 430);
    			attr_dev(span, "class", "w-full inline-block pl-1 svelte-1euneyh");
    			add_location(span, file$e, 14, 20, 488);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(13:16) <Link to=\\\"/\\\" class=\\\"block py-1  pl-1  text-gray-600 no-underline hover:text-red-600\\\">",
    		ctx
    	});

    	return block;
    }

    // (20:16) <Link to="/agenda" class="block py-1 md:py-3 pl-1 align-middle text-gray-600 no-underline hover:text-red-600">
    function create_default_slot_1$2(ctx) {
    	let i;
    	let t0;
    	let span;

    	const block = {
    		c: function create() {
    			i = element("i");
    			t0 = space();
    			span = element("span");
    			span.textContent = "Agenda";
    			attr_dev(i, "class", "bi bi-journal-bookmark-fill iconMenu svelte-1euneyh");
    			add_location(i, file$e, 20, 20, 790);
    			attr_dev(span, "class", "w-full inline-block pb-1 md:pb-0 pl-1 svelte-1euneyh");
    			add_location(span, file$e, 21, 20, 864);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(20:16) <Link to=\\\"/agenda\\\" class=\\\"block py-1 md:py-3 pl-1 align-middle text-gray-600 no-underline hover:text-red-600\\\">",
    		ctx
    	});

    	return block;
    }

    // (26:16) <Link to="/empleados" class="block py-1 md:py-3 pl-1 align-middle text-gray-600 no-underline hover:text-red-600">
    function create_default_slot$4(ctx) {
    	let i;
    	let t0;
    	let span;

    	const block = {
    		c: function create() {
    			i = element("i");
    			t0 = space();
    			span = element("span");
    			span.textContent = "Empleados";
    			attr_dev(i, "class", "bi bi-person-check iconMenu svelte-1euneyh");
    			add_location(i, file$e, 26, 20, 1166);
    			attr_dev(span, "class", "w-full inline-block pb-1 md:pb-0 pl-1 svelte-1euneyh");
    			add_location(span, file$e, 27, 20, 1232);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(26:16) <Link to=\\\"/empleados\\\" class=\\\"block py-1 md:py-3 pl-1 align-middle text-gray-600 no-underline hover:text-red-600\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let div6;
    	let div0;
    	let ul;
    	let li0;
    	let link0;
    	let t0;
    	let li1;
    	let link1;
    	let t1;
    	let li2;
    	let link2;
    	let t2;
    	let div5;
    	let div4;
    	let nav;
    	let div3;
    	let br;
    	let t3;
    	let div2;
    	let div1;
    	let button;
    	let img;
    	let img_src_value;
    	let current;

    	link0 = new Link({
    			props: {
    				to: "/",
    				class: "block py-1  pl-1  text-gray-600 no-underline hover:text-red-600",
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link1 = new Link({
    			props: {
    				to: "/agenda",
    				class: "block py-1 md:py-3 pl-1 align-middle text-gray-600 no-underline hover:text-red-600",
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link2 = new Link({
    			props: {
    				to: "/empleados",
    				class: "block py-1 md:py-3 pl-1 align-middle text-gray-600 no-underline hover:text-red-600",
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div0 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			create_component(link0.$$.fragment);
    			t0 = space();
    			li1 = element("li");
    			create_component(link1.$$.fragment);
    			t1 = space();
    			li2 = element("li");
    			create_component(link2.$$.fragment);
    			t2 = space();
    			div5 = element("div");
    			div4 = element("div");
    			nav = element("nav");
    			div3 = element("div");
    			br = element("br");
    			t3 = space();
    			div2 = element("div");
    			div1 = element("div");
    			button = element("button");
    			img = element("img");
    			attr_dev(li0, "class", "my-2 md:my-0");
    			add_location(li0, file$e, 11, 12, 280);
    			attr_dev(li1, "class", "my-2 md:my-0");
    			add_location(li1, file$e, 18, 12, 615);
    			attr_dev(li2, "class", "my-2 md:my-0");
    			add_location(li2, file$e, 24, 12, 988);
    			attr_dev(ul, "class", "list-reset ");
    			add_location(ul, file$e, 10, 8, 242);
    			attr_dev(div0, "id", "sidebar");
    			attr_dev(div0, "class", "h-screen w-16 menu bg-white text-white px-4 flex items-center nunito static fixed shadow svelte-1euneyh");
    			add_location(div0, file$e, 9, 4, 117);
    			add_location(br, file$e, 38, 20, 1742);
    			attr_dev(img, "class", "w-8 h-8 rounded-full mr-4");
    			if (img.src !== (img_src_value = "http://i.pravatar.cc/300")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Avatar of User");
    			add_location(img, file$e, 42, 32, 2003);
    			attr_dev(button, "class", "btn-indigo flex items-center focus:outline-none mr-3");
    			add_location(button, file$e, 41, 28, 1899);
    			attr_dev(div1, "class", "relative text-sm");
    			add_location(div1, file$e, 40, 24, 1839);
    			attr_dev(div2, "class", "flex relative inline-block pr-6");
    			add_location(div2, file$e, 39, 20, 1768);
    			attr_dev(div3, "class", "flex h-full justify-between items-center");
    			add_location(div3, file$e, 36, 16, 1644);
    			attr_dev(nav, "id", "header1");
    			attr_dev(nav, "class", "bg-gray-100 w-auto flex-1 border-b-1 border-gray-300 order-1 lg:order-2");
    			add_location(nav, file$e, 35, 12, 1528);
    			attr_dev(div4, "class", "h-40 lg:h-20 w-full flex flex-wrap");
    			add_location(div4, file$e, 34, 8, 1465);
    			attr_dev(div5, "class", "flex flex-row flex-wrap flex-1 flex-grow content-start pl-16");
    			add_location(div5, file$e, 33, 4, 1381);
    			attr_dev(div6, "class", "row");
    			add_location(div6, file$e, 7, 0, 92);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div0);
    			append_dev(div0, ul);
    			append_dev(ul, li0);
    			mount_component(link0, li0, null);
    			append_dev(ul, t0);
    			append_dev(ul, li1);
    			mount_component(link1, li1, null);
    			append_dev(ul, t1);
    			append_dev(ul, li2);
    			mount_component(link2, li2, null);
    			append_dev(div6, t2);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			append_dev(div4, nav);
    			append_dev(nav, div3);
    			append_dev(div3, br);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, button);
    			append_dev(button, img);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const link0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link0_changes.$$scope = { dirty, ctx };
    			}

    			link0.$set(link0_changes);
    			const link1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link1_changes.$$scope = { dirty, ctx };
    			}

    			link1.$set(link1_changes);
    			const link2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link2_changes.$$scope = { dirty, ctx };
    			}

    			link2.$set(link2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link0.$$.fragment, local);
    			transition_in(link1.$$.fragment, local);
    			transition_in(link2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link0.$$.fragment, local);
    			transition_out(link1.$$.fragment, local);
    			transition_out(link2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			destroy_component(link0);
    			destroy_component(link1);
    			destroy_component(link2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Navbar", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Link, links, navigate });
    	return [];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/components/Titulo.svelte generated by Svelte v3.38.2 */

    const file$d = "src/components/Titulo.svelte";

    function create_fragment$d(ctx) {
    	let div;
    	let h1;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			t = text(/*tituloPrincipal*/ ctx[0]);
    			attr_dev(h1, "class", "font-sans text-red-600 text-2xl font-light text-center pt-5 pb-2");
    			add_location(h1, file$d, 5, 4, 67);
    			add_location(div, file$d, 4, 0, 56);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(h1, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*tituloPrincipal*/ 1) set_data_dev(t, /*tituloPrincipal*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Titulo", slots, []);
    	let { tituloPrincipal } = $$props;
    	const writable_props = ["tituloPrincipal"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Titulo> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("tituloPrincipal" in $$props) $$invalidate(0, tituloPrincipal = $$props.tituloPrincipal);
    	};

    	$$self.$capture_state = () => ({ tituloPrincipal });

    	$$self.$inject_state = $$props => {
    		if ("tituloPrincipal" in $$props) $$invalidate(0, tituloPrincipal = $$props.tituloPrincipal);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [tituloPrincipal];
    }

    class Titulo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { tituloPrincipal: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Titulo",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*tituloPrincipal*/ ctx[0] === undefined && !("tituloPrincipal" in props)) {
    			console.warn("<Titulo> was created without expected prop 'tituloPrincipal'");
    		}
    	}

    	get tituloPrincipal() {
    		throw new Error("<Titulo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tituloPrincipal(value) {
    		throw new Error("<Titulo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/views/Agenda.svelte generated by Svelte v3.38.2 */

    const { console: console_1 } = globals;
    const file$c = "src/views/Agenda.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (68:8) {#each todos as item}
    function create_each_block$3(ctx) {
    	let div;
    	let p;
    	let t0_value = /*item*/ ctx[11].texto + "";
    	let t0;
    	let p_class_value;
    	let t1;
    	let button0;
    	let i0;
    	let t2;
    	let i0_class_value;
    	let button0_class_value;
    	let t3;
    	let button1;
    	let i1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			button0 = element("button");
    			i0 = element("i");
    			t2 = text("Editar");
    			t3 = space();
    			button1 = element("button");
    			i1 = element("i");
    			i1.textContent = "Eliminar";

    			attr_dev(p, "class", p_class_value = /*item*/ ctx[11].estado
    			? "text-decoration-line-through"
    			: "");

    			add_location(p, file$c, 69, 16, 1994);
    			attr_dev(i0, "class", i0_class_value = /*classIcono*/ ctx[6](/*item*/ ctx[11].estado));
    			add_location(i0, file$c, 73, 20, 2233);
    			attr_dev(button0, "class", button0_class_value = "btn btn-sm " + /*classEstado*/ ctx[7](/*item*/ ctx[11].estado));
    			add_location(button0, file$c, 72, 16, 2128);
    			attr_dev(i1, "class", "bi bi-trash");
    			add_location(i1, file$c, 76, 20, 2411);
    			attr_dev(button1, "class", "btn btn-sm btn-danger");
    			add_location(button1, file$c, 75, 16, 2323);
    			attr_dev(div, "class", "shadow my-3 p-3 lead");
    			add_location(div, file$c, 68, 12, 1942);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, t0);
    			append_dev(div, t1);
    			append_dev(div, button0);
    			append_dev(button0, i0);
    			append_dev(i0, t2);
    			append_dev(div, t3);
    			append_dev(div, button1);
    			append_dev(button1, i1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						button0,
    						"click",
    						function () {
    							if (is_function(/*editTodo*/ ctx[5](/*item*/ ctx[11].id))) /*editTodo*/ ctx[5](/*item*/ ctx[11].id).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						button1,
    						"click",
    						function () {
    							if (is_function(/*delTodo*/ ctx[4](/*item*/ ctx[11].id))) /*delTodo*/ ctx[4](/*item*/ ctx[11].id).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*todos*/ 2 && t0_value !== (t0_value = /*item*/ ctx[11].texto + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*todos*/ 2 && p_class_value !== (p_class_value = /*item*/ ctx[11].estado
    			? "text-decoration-line-through"
    			: "")) {
    				attr_dev(p, "class", p_class_value);
    			}

    			if (dirty & /*todos*/ 2 && i0_class_value !== (i0_class_value = /*classIcono*/ ctx[6](/*item*/ ctx[11].estado))) {
    				attr_dev(i0, "class", i0_class_value);
    			}

    			if (dirty & /*todos*/ 2 && button0_class_value !== (button0_class_value = "btn btn-sm " + /*classEstado*/ ctx[7](/*item*/ ctx[11].estado))) {
    				attr_dev(button0, "class", button0_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(68:8) {#each todos as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let div5;
    	let navbar;
    	let t0;
    	let div4;
    	let titulo;
    	let t1;
    	let form;
    	let input;
    	let t2;
    	let t3;
    	let div3;
    	let div2;
    	let div1;
    	let div0;
    	let t5;
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	navbar = new Navbar({ $$inline: true });

    	titulo = new Titulo({
    			props: { tituloPrincipal: "Agenda personal" },
    			$$inline: true
    		});

    	let each_value = /*todos*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			div4 = element("div");
    			create_component(titulo.$$.fragment);
    			t1 = space();
    			form = element("form");
    			input = element("input");
    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "Hello, world! This is a toast message.";
    			t5 = space();
    			button = element("button");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Enter para agregar una nueva tarea");
    			attr_dev(input, "class", "form-control shadow border-0");
    			add_location(input, file$c, 60, 12, 1668);
    			add_location(form, file$c, 59, 8, 1613);
    			attr_dev(div0, "class", "toast-body");
    			add_location(div0, file$c, 86, 20, 2842);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn-close btn-close-white me-2 m-auto");
    			attr_dev(button, "data-bs-dismiss", "toast");
    			attr_dev(button, "aria-label", "Close");
    			add_location(button, file$c, 89, 20, 2980);
    			attr_dev(div1, "class", "d-flex");
    			add_location(div1, file$c, 85, 16, 2800);
    			attr_dev(div2, "class", "toast align-items-center text-white bg-primary border-0");
    			attr_dev(div2, "role", "alert");
    			attr_dev(div2, "aria-live", "assertive");
    			attr_dev(div2, "aria-atomic", "true");
    			add_location(div2, file$c, 81, 12, 2597);
    			attr_dev(div3, "class", "toast-container position-absolute p-3 top-0 end-0");
    			add_location(div3, file$c, 80, 8, 2520);
    			attr_dev(div4, "class", "container w-full md:w-5/5 xl:w-5/5  mx-auto px-2");
    			add_location(div4, file$c, 57, 4, 1487);
    			attr_dev(div5, "class", "");
    			add_location(div5, file$c, 55, 0, 1451);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			mount_component(navbar, div5, null);
    			append_dev(div5, t0);
    			append_dev(div5, div4);
    			mount_component(titulo, div4, null);
    			append_dev(div4, t1);
    			append_dev(div4, form);
    			append_dev(form, input);
    			set_input_value(input, /*todo*/ ctx[2].texto);
    			append_dev(div4, t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div4, null);
    			}

    			append_dev(div4, t3);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div1, t5);
    			append_dev(div1, button);
    			/*div2_binding*/ ctx[9](div2);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[8]),
    					listen_dev(form, "submit", prevent_default(/*addTodo*/ ctx[3]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*todo*/ 4 && input.value !== /*todo*/ ctx[2].texto) {
    				set_input_value(input, /*todo*/ ctx[2].texto);
    			}

    			if (dirty & /*delTodo, todos, classEstado, editTodo, classIcono*/ 242) {
    				each_value = /*todos*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div4, t3);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(titulo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(titulo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_component(navbar);
    			destroy_component(titulo);
    			destroy_each(each_blocks, detaching);
    			/*div2_binding*/ ctx[9](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Agenda", slots, []);
    	let toastEl;

    	const mostrarToast = opciones => {
    		new Toast(toastEl).show();
    	};

    	let todos = [];
    	let todo = { id: "", texto: "", estado: false };

    	if (localStorage.getItem("todos")) {
    		todos = JSON.parse(localStorage.getItem("todos"));
    	}

    	const addTodo = () => {
    		if (!todo.texto.trim()) {
    			console.log("texto vacio");
    			$$invalidate(2, todo.texto = "", todo);
    			return;
    		}

    		$$invalidate(2, todo.id = Date.now(), todo);
    		$$invalidate(1, todos = [...todos, todo]);
    		console.log(todos);
    		$$invalidate(2, todo = { id: "", texto: "", estado: false });
    		mostrarToast();
    	};

    	const delTodo = id => {
    		$$invalidate(1, todos = todos.filter(item => item.id !== id));
    	};

    	const editTodo = id => {
    		$$invalidate(1, todos = todos.map(item => {
    			if (item.id === id) {
    				return { ...item, estado: !item.estado };
    			} else {
    				return item;
    			}
    		}));

    		console.log(todos);
    	};

    	const classIcono = valor => valor ? "bi bi-arrow-clockwise" : "bi bi-check2";
    	const classEstado = valor => valor ? "btn-success" : "btn-warning";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Agenda> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		todo.texto = this.value;
    		$$invalidate(2, todo);
    	}

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			toastEl = $$value;
    			$$invalidate(0, toastEl);
    		});
    	}

    	$$self.$capture_state = () => ({
    		Navbar,
    		Titulo,
    		toastEl,
    		mostrarToast,
    		todos,
    		todo,
    		addTodo,
    		delTodo,
    		editTodo,
    		classIcono,
    		classEstado
    	});

    	$$self.$inject_state = $$props => {
    		if ("toastEl" in $$props) $$invalidate(0, toastEl = $$props.toastEl);
    		if ("todos" in $$props) $$invalidate(1, todos = $$props.todos);
    		if ("todo" in $$props) $$invalidate(2, todo = $$props.todo);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*toastEl*/ 1) {
    			console.log(toastEl);
    		}

    		if ($$self.$$.dirty & /*todos*/ 2) {
    			localStorage.setItem("todos", JSON.stringify(todos));
    		}
    	};

    	return [
    		toastEl,
    		todos,
    		todo,
    		addTodo,
    		delTodo,
    		editTodo,
    		classIcono,
    		classEstado,
    		input_input_handler,
    		div2_binding
    	];
    }

    class Agenda extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Agenda",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    const createOptions = () => {
        const {subscribe, set } = writable({
            sortable: true,
            pagination: true,
            rowPerPage: 50,
            columnFilter: false,
            scrollY: true,
            css: true,
            labels: {
                search: 'Search...',
                filter: 'Filter',
                noRows: 'No entries to found',
                info: 'Showing {start} to {end} of {rows} entries',
                previous: 'Previous',
                next: 'Next',
            },
            blocks: {
                searchInput: true, 
                paginationButtons: true,
                paginationRowCount: true,
            }
        });
        return {
            subscribe, set, 
            get: () => {
                let $store;
                options.subscribe(store => $store = store);
                return $store
            },
            update: (opt) => {
                opt.labels = opt.labels ? opt.labels : {};
                const labels = {
                    search:   typeof opt.labels.search   === 'string' ? opt.labels.search   : 'Search...',
                    filter:   typeof opt.labels.filter   === 'string' ? opt.labels.filter   : 'Filter',
                    noRows:   typeof opt.labels.noRows   === 'string' ? opt.labels.noRows   : 'No entries to found',
                    info:     typeof opt.labels.info     === 'string' ? opt.labels.info     : 'Showing {start} to {end} of {rows} entries',
                    previous: typeof opt.labels.previous === 'string' ? opt.labels.previous : 'Previous',
                    next:     typeof opt.labels.next     === 'string' ? opt.labels.next     : 'Next',                
                };   
                opt.blocks = opt.blocks ? opt.blocks : {};
                const blocks = {
                    searchInput:        typeof opt.blocks.searchInput        === 'boolean' ? opt.blocks.searchInput        : true, 
                    paginationButtons:  typeof opt.blocks.paginationButtons  === 'boolean' ? opt.blocks.paginationButtons  : true,
                    paginationRowCount: typeof opt.blocks.paginationRowCount === 'boolean' ? opt.blocks.paginationRowCount : true,
                };
                const parsed = {
                    sortable:     typeof opt.sortable     === 'boolean' ? opt.sortable     : true,
                    pagination:   typeof opt.pagination   === 'boolean' ? opt.pagination   : true,
                    rowPerPage:   typeof opt.rowPerPage   === 'number'  ? opt.rowPerPage   : 50,
                    columnFilter: typeof opt.columnFilter === 'boolean' ? opt.columnFilter : false, 
                    scrollY:      typeof opt.scrollY      === 'boolean' ? opt.scrollY      : true, 
                    css:          typeof opt.css          === 'boolean' ? opt.css          : true, 
                    labels: labels,
                    blocks: blocks
                };
                options.set(parsed);
            }
        }
    };
    const options = createOptions();

    const rowCount = writable(0);

    const createPageNumber = () => {
    	const { subscribe, update } = writable(1);
    	return {
    		subscribe, update,
    		set: (number) => update(store => {
    			let $rowPerPage, $rowCount;
    			rowCount.subscribe(store => $rowCount = store);
    			options.subscribe(store => $rowPerPage = store.rowPerPage);
    			if ( number >= 1 && number <= Math.ceil($rowCount / $rowPerPage) ) {
    				store = parseInt(number);
    			}
    			document.querySelector('section.datatable .dt-table').scrollTop = 0;
    			return store
    		})
    	}
    };
    const pageNumber = createPageNumber();

    const datatableWidth = writable(null);

    const createLocal = () => {
    	const { subscribe, update } = writable([]);
    	return {
    		subscribe, update,
    		add: (key, value) => update(store => {
    			const filter = {key: key, value: value}; 
    			store = store.filter(item => { return item.key !== key && item.value.length > 0 });
    			store.push(filter);
    			return store
    		}),
    		remove: () => update(store => [])
    	}
    };
    const local = createLocal();

    const createGlobal = () => {
    	const { subscribe, update } = writable(null);
    	return {
    		subscribe, 
    		set: (value) => update(store => {
    			store = (value.length > 0) ? value : null;
    			return store
    		}),
    		remove: () => update(store => null)
    	}
    };
    const global$1 = createGlobal();

    const createData = () => {
    	const { subscribe, set, update } = writable([]);
    	return {
    		subscribe, set,
    		sortAsc: (key) => update(store => {
    			try {
    				store.sort( (a, b) => key(b).localeCompare(key(a)) );
    			} catch (e) {
    				return store.sort( (a, b) => parseFloat(key(b)) - parseFloat(key(a)))
    			}
    			return store.sort( (a, b) => key(b).localeCompare(key(a)) )
    			
    		}),
    		sortDesc: (key) => update(store => {
    			try {
    				store.sort( (a, b) => key(a).localeCompare(key(b)) );
    			} catch (e) {
    				return store.sort( (a, b) => parseFloat(key(a)) - parseFloat(key(b)))
    			}
    			return store.sort( (a, b) => key(a).localeCompare(key(b)) )
    		}),
    	}
    };
    const data = createData();

    const filtered = derived(
    	[data, global$1, local],
        ([$data, $global, $local]) => {
    		if ($global) {
    			$data = $data.filter( item => {
    				return Object.keys(item).some( k => {
    					return item[k].toString().toLowerCase().indexOf($global.toString().toLowerCase()) > -1
    				})
    			});
    		}
    		if ($local.length > 0) {
    			$local.forEach(filter => {
    				return $data = $data.filter( item => filter.key(item).toString().toLowerCase().indexOf(filter.value.toString().toLowerCase()) > -1)
    			});
    		}
    		rowCount.set($data.length);
    		return $data
    	} 	
    );

    const rows = derived(
    	[filtered, options, pageNumber],
        ([$filtered, $options, $pageNumber]) => {
    		if (!$options.pagination) {
    			return $filtered
    		}
    		return $filtered.slice( ($pageNumber - 1) * $options.rowPerPage, $pageNumber * $options.rowPerPage) 
    	} 
    );

    const createColumns = () => {
    	const { subscribe, set, update } = writable([]);
    	return {
    		subscribe, set, update,
    		get: () => {
    			let $columns;
    			columns.subscribe(store => $columns = store);
    			return $columns
    		},
    		sort: (element, key) => {
    			if (options.get().sortable !== true || typeof key === 'undefined') {
    				return
    			}
    			if (
    				element.classList.contains('sortable') &&
    				element.classList.contains('asc')
    			) {
    				Array.from(element.parentNode.children).forEach((item) =>
    					item.classList.remove('asc', 'desc')
    				);
    				element.classList.add('desc');
    				data.sortDesc(key);
    				pageNumber.set(1);
    			} else {
    				Array.from(element.parentNode.children).forEach((item) =>
    					item.classList.remove('desc', 'asc')
    				);
    				element.classList.add('asc');
    				data.sortAsc(key);
    				pageNumber.set(1);
    			}
    			columns.redraw();
    		},
    		filter: (key, value) => {
    			pageNumber.set(1);
    			local.add(key, value);
    			columns.redraw();
    		},
    		draw: () => {
    			setTimeout(() => {
    				const tbody = document.querySelector('.datatable table tbody tr');
    				if (tbody === null) return
    				const thead = document.querySelectorAll('.dt-header thead tr');
    				const $columns = columns.get();
    				thead.forEach(tr => {
    					let i = 0;
    					Array.from(tbody.children).forEach(td => {
    						let th = tr.children[i];
    						let thW = th.getBoundingClientRect().width;
    						let tdW = td.getBoundingClientRect().width;
    						// let columnMinWidth = parseFloat(columns.get()[i].minWidth.replace('px', ''))
    						if (tdW > thW) { 
    							th.style.minWidth = tdW + 'px';
    							th.style.maxWidth = tdW + 'px';
    							$columns[i].minWidth = tdW;
    						}
    						else {
    							td.style.minWidth = thW + 'px';
    							td.style.maxWidth = thW + 'px';
    							$columns[i].minWidth = thW;
    						} 
    						i++;
    					});
    				});
    			}, 50);	
    		},
    		redraw: () => {
    			if ( options.get().scrollY === false ) {
    				return
    			}
    			setTimeout(() => {
    				const tbody = document.querySelector('.datatable table tbody tr');
    				if (tbody === null) return
    				const thead = document.querySelectorAll('.dt-header thead tr');
    				thead.forEach(tr => {
    					let i = 0;
    					Array.from(tbody.children).forEach(td => {
    						let th = tr.children[i];
    						let thW = th.getBoundingClientRect().width;
    						let tdW = td.getBoundingClientRect().width;
    						let columnMinWidth = parseFloat(columns.get()[i].minWidth);
    						if (tdW > thW || thW > columnMinWidth) { 
    							th.style.minWidth = tdW + 'px';
    							th.style.maxWidth = tdW + 'px';
    						}
    						else {
    							td.style.minWidth = thW + 'px';
    							td.style.maxWidth = thW + 'px';
    						} 
    						i++;
    					});
    				});
    			}, 50);			
    		},
    	}
    };
    const columns = createColumns();

    const datatable = {
        init: () => {
            datatable.resize();
            datatable.addEventScrollX();
            datatable.getColumns();
            new ResizeObserver((mutations) => {
                datatable.resize();
            }).observe(document.querySelector('section.datatable').parentElement);
        },
        reset: () => {
            pageNumber.update(store => 1);
            global$1.remove();
            local.remove();
            columns.set([]);
        },
        setRows: (arr) => {
            arr.forEach( (item) => {
                Object.keys(item).forEach( (k) => {
                    if (item[k] === null) {
                        item[k] = '';
                    }
                });
            });
            data.set(arr);
            return
        },
        getSize: () => {
            const parent = document.querySelector('section.datatable').parentNode;
            const style = getComputedStyle(parent);
            const rect = parent.getBoundingClientRect();
            const getNumber = (pxValue) => { return parseFloat(pxValue.replace('px', ''))  }; 
            return {
                parentWidth: rect.width,
                parentHeight: rect.height,
                width: (rect.width - getNumber(style.paddingLeft) - getNumber(style.paddingRight) - getNumber(style.borderLeftWidth) - getNumber(style.borderRightWidth)) / rect.width,
                height: (rect.height - getNumber(style.paddingTop) - getNumber(style.paddingBottom) - getNumber(style.borderTopWidth) - getNumber(style.borderBottomWidth)) / rect.height,
                top: style.paddingTop,
                right: style.paddingRight,
                bottom: style.paddingBottom,
                left: style.paddingLeft
            }
        },
        resize: () => {
            if ( !document.querySelector('section.datatable') ) return
            const size = datatable.getSize();
            const tableContainer = document.querySelector('section.datatable .dt-table');
            if ( options.get().scrollY ) {
                tableContainer.style.height = datatable.getTableContainerHeight(size.parentHeight * size.height) + 'px';
                columns.redraw();
            }
            datatableWidth.set( size.parentWidth * size.width );
            if (size.parentWidth * size.width < document.querySelector('section.datatable table').offsetWidth) {
                tableContainer.style.overflowX = 'auto';
            }
        },
        getTableContainerHeight: (height) => {
            let paginationBlock;
            if (options.get().pagination && (options.get().blocks.paginationButtons || options.get().blocks.paginationRowCount)) {
                paginationBlock = true;
            }
            const calc = [
                (options.get().blocks.searchInput) ? document.querySelector('.datatable .dt-search').getBoundingClientRect().height : 0,
                (paginationBlock) ? document.querySelector('.datatable .dt-pagination').getBoundingClientRect().height : 0
            ];
            const sum = (a, b) => a + b;
            document.querySelector('section.datatable .dt-table').style.height = height - calc.reduce(sum) + 'px';
        },
        addEventScrollX: () => {
            if ( options.get().scrollY ) {
                document.querySelector('section.datatable .dt-table').addEventListener('scroll', (e) => {
                    document.querySelector('.dt-header').style.left = (-1 * e.target.scrollLeft) + 'px';
                });
            }
        },
        getColumns: () => {
            const columnList = [];
            let i = 0;
            document.querySelectorAll('.datatable table thead th').forEach(th => {
                columnList.push({
                    index: i,
                    html: th.innerHTML,
                    key: datatable.getKey(th.dataset.key),
                    sort: null,
                    classList: th.classList,
                    minWidth: th.getBoundingClientRect().width
                });
                th.addEventListener('click', (e) => {
                    columns.sort(e.target, datatable.getKey(th.dataset.key));
                }, true);
                i++;
            });
            columns.set(columnList);
        },
        getKey: (key) => {
            if (!key)  return 
            if (key && key.indexOf('=>') > 0) {
                return new Function(`'use strict';return (${key})`)()
            }
            return (x) => x[key]
        },
    };

    /* node_modules/svelte-simple-datatables/src/SearchInput.svelte generated by Svelte v3.38.2 */
    const file$b = "node_modules/svelte-simple-datatables/src/SearchInput.svelte";

    function create_fragment$b(ctx) {
    	let input;
    	let input_class_value;
    	let input_placeholder_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "class", input_class_value = "" + (null_to_empty(/*classList*/ ctx[1]) + " svelte-13ic5ji"));
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", input_placeholder_value = /*$options*/ ctx[2].labels.search);
    			attr_dev(input, "ref", /*ref*/ ctx[0]);
    			toggle_class(input, "css", /*$options*/ ctx[2].css);
    			add_location(input, file$b, 14, 0, 403);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_handler*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*classList*/ 2 && input_class_value !== (input_class_value = "" + (null_to_empty(/*classList*/ ctx[1]) + " svelte-13ic5ji"))) {
    				attr_dev(input, "class", input_class_value);
    			}

    			if (dirty & /*$options*/ 4 && input_placeholder_value !== (input_placeholder_value = /*$options*/ ctx[2].labels.search)) {
    				attr_dev(input, "placeholder", input_placeholder_value);
    			}

    			if (dirty & /*ref*/ 1) {
    				attr_dev(input, "ref", /*ref*/ ctx[0]);
    			}

    			if (dirty & /*classList, $options*/ 6) {
    				toggle_class(input, "css", /*$options*/ ctx[2].css);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let $options;
    	validate_store(options, "options");
    	component_subscribe($$self, options, $$value => $$invalidate(2, $options = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SearchInput", slots, []);
    	let { ref = "" } = $$props;
    	let { classList = "" } = $$props;

    	const search = value => {
    		pageNumber.set(1);
    		global$1.set(value);
    		columns.redraw();
    	};

    	const writable_props = ["ref", "classList"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SearchInput> was created with unknown prop '${key}'`);
    	});

    	const input_handler = e => search(e.target.value);

    	$$self.$$set = $$props => {
    		if ("ref" in $$props) $$invalidate(0, ref = $$props.ref);
    		if ("classList" in $$props) $$invalidate(1, classList = $$props.classList);
    	};

    	$$self.$capture_state = () => ({
    		options,
    		pageNumber,
    		columns,
    		global: global$1,
    		ref,
    		classList,
    		search,
    		$options
    	});

    	$$self.$inject_state = $$props => {
    		if ("ref" in $$props) $$invalidate(0, ref = $$props.ref);
    		if ("classList" in $$props) $$invalidate(1, classList = $$props.classList);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [ref, classList, $options, search, input_handler];
    }

    class SearchInput extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { ref: 0, classList: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SearchInput",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get ref() {
    		throw new Error("<SearchInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ref(value) {
    		throw new Error("<SearchInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classList() {
    		throw new Error("<SearchInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classList(value) {
    		throw new Error("<SearchInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-simple-datatables/src/components/Search.svelte generated by Svelte v3.38.2 */
    const file$a = "node_modules/svelte-simple-datatables/src/components/Search.svelte";

    function create_fragment$a(ctx) {
    	let section;
    	let searchinput;
    	let current;
    	searchinput = new SearchInput({ $$inline: true });

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(searchinput.$$.fragment);
    			attr_dev(section, "class", "dt-search svelte-1f425ri");
    			toggle_class(section, "css", /*$options*/ ctx[0].css);
    			add_location(section, file$a, 5, 0, 128);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(searchinput, section, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$options*/ 1) {
    				toggle_class(section, "css", /*$options*/ ctx[0].css);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(searchinput.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(searchinput.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(searchinput);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let $options;
    	validate_store(options, "options");
    	component_subscribe($$self, options, $$value => $$invalidate(0, $options = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Search", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Search> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ SearchInput, options, $options });
    	return [$options];
    }

    class Search extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Search",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* node_modules/svelte-simple-datatables/src/PaginationRowCount.svelte generated by Svelte v3.38.2 */
    const file$9 = "node_modules/svelte-simple-datatables/src/PaginationRowCount.svelte";

    // (19:4) {:else}
    function create_else_block_1(ctx) {
    	let html_tag;
    	let raw_value = `<b>${/*start*/ ctx[0]}</b>-<b>${/*end*/ ctx[2]}</b>/<b>${/*rows*/ ctx[3]}</b>` + "";
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_anchor = empty();
    			html_tag = new HtmlTag(html_anchor);
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*start, end, rows*/ 13 && raw_value !== (raw_value = `<b>${/*start*/ ctx[0]}</b>-<b>${/*end*/ ctx[2]}</b>/<b>${/*rows*/ ctx[3]}</b>` + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(19:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (13:4) {#if $datatableWidth > 600}
    function create_if_block$5(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*rows*/ ctx[3] > 0) return create_if_block_1$4;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(13:4) {#if $datatableWidth > 600}",
    		ctx
    	});

    	return block;
    }

    // (16:8) {:else}
    function create_else_block$2(ctx) {
    	let html_tag;
    	let raw_value = /*$options*/ ctx[1].labels.noRows + "";
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_anchor = empty();
    			html_tag = new HtmlTag(html_anchor);
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$options*/ 2 && raw_value !== (raw_value = /*$options*/ ctx[1].labels.noRows + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(16:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (14:8) {#if rows > 0}
    function create_if_block_1$4(ctx) {
    	let html_tag;
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_anchor = empty();
    			html_tag = new HtmlTag(html_anchor);
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(/*info*/ ctx[4], target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*info*/ 16) html_tag.p(/*info*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(14:8) {#if rows > 0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let aside;

    	function select_block_type(ctx, dirty) {
    		if (/*$datatableWidth*/ ctx[5] > 600) return create_if_block$5;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			aside = element("aside");
    			if_block.c();
    			attr_dev(aside, "class", "dt-pagination-rowcount svelte-1kb8lox");
    			toggle_class(aside, "css", /*$options*/ ctx[1].css);
    			add_location(aside, file$9, 11, 0, 470);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, aside, anchor);
    			if_block.m(aside, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(aside, null);
    				}
    			}

    			if (dirty & /*$options*/ 2) {
    				toggle_class(aside, "css", /*$options*/ ctx[1].css);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(aside);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let start;
    	let end;
    	let rows;
    	let info;
    	let $pageNumber;
    	let $options;
    	let $rowCount;
    	let $datatableWidth;
    	validate_store(pageNumber, "pageNumber");
    	component_subscribe($$self, pageNumber, $$value => $$invalidate(6, $pageNumber = $$value));
    	validate_store(options, "options");
    	component_subscribe($$self, options, $$value => $$invalidate(1, $options = $$value));
    	validate_store(rowCount, "rowCount");
    	component_subscribe($$self, rowCount, $$value => $$invalidate(7, $rowCount = $$value));
    	validate_store(datatableWidth, "datatableWidth");
    	component_subscribe($$self, datatableWidth, $$value => $$invalidate(5, $datatableWidth = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PaginationRowCount", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PaginationRowCount> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		options,
    		pageNumber,
    		rowCount,
    		datatableWidth,
    		start,
    		$pageNumber,
    		$options,
    		end,
    		$rowCount,
    		rows,
    		info,
    		$datatableWidth
    	});

    	$$self.$inject_state = $$props => {
    		if ("start" in $$props) $$invalidate(0, start = $$props.start);
    		if ("end" in $$props) $$invalidate(2, end = $$props.end);
    		if ("rows" in $$props) $$invalidate(3, rows = $$props.rows);
    		if ("info" in $$props) $$invalidate(4, info = $$props.info);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$pageNumber, $options*/ 66) {
    			$$invalidate(0, start = $pageNumber * $options.rowPerPage - $options.rowPerPage + 1);
    		}

    		if ($$self.$$.dirty & /*$pageNumber, $options, $rowCount*/ 194) {
    			$$invalidate(2, end = Math.min($pageNumber * $options.rowPerPage, $rowCount));
    		}

    		if ($$self.$$.dirty & /*$rowCount*/ 128) {
    			$$invalidate(3, rows = $rowCount);
    		}

    		if ($$self.$$.dirty & /*$options, start, end, rows*/ 15) {
    			$$invalidate(4, info = $options.labels.info.replace("{start}", `<b>${start}</b>`).replace("{end}", `<b>${end}</b>`).replace("{rows}", `<b>${rows}</b>`));
    		}
    	};

    	return [start, $options, end, rows, info, $datatableWidth, $pageNumber, $rowCount];
    }

    class PaginationRowCount extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PaginationRowCount",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* node_modules/svelte-simple-datatables/src/PaginationButtons.svelte generated by Svelte v3.38.2 */
    const file$8 = "node_modules/svelte-simple-datatables/src/PaginationButtons.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	return child_ctx;
    }

    // (70:0) {:else}
    function create_else_block$1(ctx) {
    	let section;
    	let button0;
    	let t1;
    	let button1;
    	let t3;
    	let button2;
    	let t5;
    	let button3;
    	let section_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			section = element("section");
    			button0 = element("button");
    			button0.textContent = "❬❬";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "❮";
    			t3 = space();
    			button2 = element("button");
    			button2.textContent = "❯";
    			t5 = space();
    			button3 = element("button");
    			button3.textContent = "❭❭";
    			attr_dev(button0, "class", "svelte-raj9hg");
    			toggle_class(button0, "disabled", /*$pageNumber*/ ctx[4] === 1);
    			add_location(button0, file$8, 71, 8, 2390);
    			attr_dev(button1, "class", "svelte-raj9hg");
    			toggle_class(button1, "disabled", /*$pageNumber*/ ctx[4] === 1);
    			add_location(button1, file$8, 72, 8, 2496);
    			attr_dev(button2, "class", "svelte-raj9hg");
    			toggle_class(button2, "disabled", /*$pageNumber*/ ctx[4] === /*pageCount*/ ctx[2].length);
    			add_location(button2, file$8, 73, 8, 2608);
    			attr_dev(button3, "class", "svelte-raj9hg");
    			toggle_class(button3, "disabled", /*$pageNumber*/ ctx[4] === /*pageCount*/ ctx[2].length);
    			add_location(button3, file$8, 74, 8, 2736);
    			attr_dev(section, "class", section_class_value = "dt-pagination-buttons mobile " + /*classList*/ ctx[1] + " svelte-raj9hg");
    			toggle_class(section, "css", /*$options*/ ctx[3].css);
    			add_location(section, file$8, 70, 4, 2297);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, button0);
    			append_dev(section, t1);
    			append_dev(section, button1);
    			append_dev(section, t3);
    			append_dev(section, button2);
    			append_dev(section, t5);
    			append_dev(section, button3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler_5*/ ctx[14], false, false, false),
    					listen_dev(button1, "click", /*click_handler_6*/ ctx[15], false, false, false),
    					listen_dev(button2, "click", /*click_handler_7*/ ctx[16], false, false, false),
    					listen_dev(button3, "click", /*click_handler_8*/ ctx[17], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$pageNumber*/ 16) {
    				toggle_class(button0, "disabled", /*$pageNumber*/ ctx[4] === 1);
    			}

    			if (dirty & /*$pageNumber*/ 16) {
    				toggle_class(button1, "disabled", /*$pageNumber*/ ctx[4] === 1);
    			}

    			if (dirty & /*$pageNumber, pageCount*/ 20) {
    				toggle_class(button2, "disabled", /*$pageNumber*/ ctx[4] === /*pageCount*/ ctx[2].length);
    			}

    			if (dirty & /*$pageNumber, pageCount*/ 20) {
    				toggle_class(button3, "disabled", /*$pageNumber*/ ctx[4] === /*pageCount*/ ctx[2].length);
    			}

    			if (dirty & /*classList*/ 2 && section_class_value !== (section_class_value = "dt-pagination-buttons mobile " + /*classList*/ ctx[1] + " svelte-raj9hg")) {
    				attr_dev(section, "class", section_class_value);
    			}

    			if (dirty & /*classList, $options*/ 10) {
    				toggle_class(section, "css", /*$options*/ ctx[3].css);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(70:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (25:0) {#if $datatableWidth > 600}
    function create_if_block$4(ctx) {
    	let section;
    	let button0;
    	let raw0_value = /*$options*/ ctx[3].labels.previous + "";
    	let t0;
    	let button1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let button2;
    	let raw1_value = /*$options*/ ctx[3].labels.next + "";
    	let section_class_value;
    	let mounted;
    	let dispose;
    	let if_block0 = /*pageCount*/ ctx[2].length > 6 && /*$pageNumber*/ ctx[4] >= 5 && create_if_block_4(ctx);
    	let each_value = /*buttons*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	let if_block1 = /*pageCount*/ ctx[2].length > 6 && /*$pageNumber*/ ctx[4] <= /*pageCount*/ ctx[2].length - 3 && create_if_block_2$2(ctx);
    	let if_block2 = /*pageCount*/ ctx[2].length > 1 && create_if_block_1$3(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			button0 = element("button");
    			t0 = space();
    			button1 = element("button");
    			button1.textContent = "1";
    			t2 = space();
    			if (if_block0) if_block0.c();
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			if (if_block1) if_block1.c();
    			t5 = space();
    			if (if_block2) if_block2.c();
    			t6 = space();
    			button2 = element("button");
    			attr_dev(button0, "class", "text svelte-raj9hg");
    			toggle_class(button0, "disabled", /*$pageNumber*/ ctx[4] === 1);
    			add_location(button0, file$8, 26, 8, 905);
    			attr_dev(button1, "class", "svelte-raj9hg");
    			toggle_class(button1, "active", /*$pageNumber*/ ctx[4] === 1);
    			add_location(button1, file$8, 33, 8, 1128);
    			attr_dev(button2, "class", "text svelte-raj9hg");
    			toggle_class(button2, "disabled", /*$pageNumber*/ ctx[4] === /*pageCount*/ ctx[2].length);
    			add_location(button2, file$8, 61, 8, 2042);
    			attr_dev(section, "class", section_class_value = "dt-pagination-buttons " + /*classList*/ ctx[1] + " svelte-raj9hg");
    			attr_dev(section, "ref", /*ref*/ ctx[0]);
    			toggle_class(section, "css", /*$options*/ ctx[3].css);
    			add_location(section, file$8, 25, 4, 813);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, button0);
    			button0.innerHTML = raw0_value;
    			append_dev(section, t0);
    			append_dev(section, button1);
    			append_dev(section, t2);
    			if (if_block0) if_block0.m(section, null);
    			append_dev(section, t3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(section, null);
    			}

    			append_dev(section, t4);
    			if (if_block1) if_block1.m(section, null);
    			append_dev(section, t5);
    			if (if_block2) if_block2.m(section, null);
    			append_dev(section, t6);
    			append_dev(section, button2);
    			button2.innerHTML = raw1_value;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[9], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[10], false, false, false),
    					listen_dev(button2, "click", /*click_handler_4*/ ctx[13], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$options*/ 8 && raw0_value !== (raw0_value = /*$options*/ ctx[3].labels.previous + "")) button0.innerHTML = raw0_value;
    			if (dirty & /*$pageNumber*/ 16) {
    				toggle_class(button0, "disabled", /*$pageNumber*/ ctx[4] === 1);
    			}

    			if (dirty & /*$pageNumber*/ 16) {
    				toggle_class(button1, "active", /*$pageNumber*/ ctx[4] === 1);
    			}

    			if (/*pageCount*/ ctx[2].length > 6 && /*$pageNumber*/ ctx[4] >= 5) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					if_block0.m(section, t3);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*$pageNumber, buttons, setPage, pageCount*/ 180) {
    				each_value = /*buttons*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(section, t4);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (/*pageCount*/ ctx[2].length > 6 && /*$pageNumber*/ ctx[4] <= /*pageCount*/ ctx[2].length - 3) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_2$2(ctx);
    					if_block1.c();
    					if_block1.m(section, t5);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*pageCount*/ ctx[2].length > 1) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_1$3(ctx);
    					if_block2.c();
    					if_block2.m(section, t6);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*$options*/ 8 && raw1_value !== (raw1_value = /*$options*/ ctx[3].labels.next + "")) button2.innerHTML = raw1_value;
    			if (dirty & /*$pageNumber, pageCount*/ 20) {
    				toggle_class(button2, "disabled", /*$pageNumber*/ ctx[4] === /*pageCount*/ ctx[2].length);
    			}

    			if (dirty & /*classList*/ 2 && section_class_value !== (section_class_value = "dt-pagination-buttons " + /*classList*/ ctx[1] + " svelte-raj9hg")) {
    				attr_dev(section, "class", section_class_value);
    			}

    			if (dirty & /*ref*/ 1) {
    				attr_dev(section, "ref", /*ref*/ ctx[0]);
    			}

    			if (dirty & /*classList, $options*/ 10) {
    				toggle_class(section, "css", /*$options*/ ctx[3].css);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (if_block0) if_block0.d();
    			destroy_each(each_blocks, detaching);
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(25:0) {#if $datatableWidth > 600}",
    		ctx
    	});

    	return block;
    }

    // (37:8) {#if pageCount.length > 6 && $pageNumber >= 5}
    function create_if_block_4(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "...";
    			attr_dev(button, "class", "ellipse svelte-raj9hg");
    			add_location(button, file$8, 37, 12, 1303);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(37:8) {#if pageCount.length > 6 && $pageNumber >= 5}",
    		ctx
    	});

    	return block;
    }

    // (42:12) {#if n > 0 && n < pageCount.length - 1}
    function create_if_block_3(ctx) {
    	let button;
    	let t_value = /*n*/ ctx[19] + 1 + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_2() {
    		return /*click_handler_2*/ ctx[11](/*n*/ ctx[19]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			attr_dev(button, "class", "svelte-raj9hg");
    			toggle_class(button, "active", /*$pageNumber*/ ctx[4] === /*n*/ ctx[19] + 1);
    			add_location(button, file$8, 42, 12, 1453);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_2, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*buttons*/ 32 && t_value !== (t_value = /*n*/ ctx[19] + 1 + "")) set_data_dev(t, t_value);

    			if (dirty & /*$pageNumber, buttons*/ 48) {
    				toggle_class(button, "active", /*$pageNumber*/ ctx[4] === /*n*/ ctx[19] + 1);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(42:12) {#if n > 0 && n < pageCount.length - 1}",
    		ctx
    	});

    	return block;
    }

    // (41:8) {#each buttons as n}
    function create_each_block$2(ctx) {
    	let if_block_anchor;
    	let if_block = /*n*/ ctx[19] > 0 && /*n*/ ctx[19] < /*pageCount*/ ctx[2].length - 1 && create_if_block_3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*n*/ ctx[19] > 0 && /*n*/ ctx[19] < /*pageCount*/ ctx[2].length - 1) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_3(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(41:8) {#each buttons as n}",
    		ctx
    	});

    	return block;
    }

    // (52:8) {#if pageCount.length > 6 && $pageNumber <= pageCount.length - 3}
    function create_if_block_2$2(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "...";
    			attr_dev(button, "class", "ellipse svelte-raj9hg");
    			add_location(button, file$8, 52, 12, 1754);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(52:8) {#if pageCount.length > 6 && $pageNumber <= pageCount.length - 3}",
    		ctx
    	});

    	return block;
    }

    // (56:8) {#if pageCount.length > 1}
    function create_if_block_1$3(ctx) {
    	let button;
    	let t_value = /*pageCount*/ ctx[2].length + "";
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			attr_dev(button, "class", "svelte-raj9hg");
    			toggle_class(button, "active", /*$pageNumber*/ ctx[4] === /*pageCount*/ ctx[2].length);
    			add_location(button, file$8, 56, 12, 1857);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_3*/ ctx[12], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*pageCount*/ 4 && t_value !== (t_value = /*pageCount*/ ctx[2].length + "")) set_data_dev(t, t_value);

    			if (dirty & /*$pageNumber, pageCount*/ 20) {
    				toggle_class(button, "active", /*$pageNumber*/ ctx[4] === /*pageCount*/ ctx[2].length);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(56:8) {#if pageCount.length > 1}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*$datatableWidth*/ ctx[6] > 600) return create_if_block$4;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let pageCount;
    	let buttons;
    	let $rowCount;
    	let $options;
    	let $pageNumber;
    	let $datatableWidth;
    	validate_store(rowCount, "rowCount");
    	component_subscribe($$self, rowCount, $$value => $$invalidate(8, $rowCount = $$value));
    	validate_store(options, "options");
    	component_subscribe($$self, options, $$value => $$invalidate(3, $options = $$value));
    	validate_store(pageNumber, "pageNumber");
    	component_subscribe($$self, pageNumber, $$value => $$invalidate(4, $pageNumber = $$value));
    	validate_store(datatableWidth, "datatableWidth");
    	component_subscribe($$self, datatableWidth, $$value => $$invalidate(6, $datatableWidth = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PaginationButtons", slots, []);
    	let { ref = "" } = $$props;
    	let { classList = "" } = $$props;

    	const slice = (arr, page) => {
    		if (page < 5) {
    			return arr.slice(0, 5);
    		} else if (page > arr.length - 4) {
    			return arr.slice(arr.length - 5, arr.length);
    		}

    		return arr.slice(page - 2, page + 1);
    	};

    	const setPage = number => {
    		pageNumber.set(number);
    		columns.redraw();
    	};

    	const writable_props = ["ref", "classList"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PaginationButtons> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => setPage($pageNumber - 1);
    	const click_handler_1 = () => setPage(1);
    	const click_handler_2 = n => setPage(n + 1);
    	const click_handler_3 = () => setPage(pageCount.length);
    	const click_handler_4 = () => setPage($pageNumber + 1);
    	const click_handler_5 = () => setPage(1);
    	const click_handler_6 = () => setPage($pageNumber - 1);
    	const click_handler_7 = () => setPage($pageNumber + 1);
    	const click_handler_8 = () => setPage(pageCount.length);

    	$$self.$$set = $$props => {
    		if ("ref" in $$props) $$invalidate(0, ref = $$props.ref);
    		if ("classList" in $$props) $$invalidate(1, classList = $$props.classList);
    	};

    	$$self.$capture_state = () => ({
    		options,
    		rowCount,
    		pageNumber,
    		datatableWidth,
    		columns,
    		ref,
    		classList,
    		slice,
    		setPage,
    		pageCount,
    		$rowCount,
    		$options,
    		buttons,
    		$pageNumber,
    		$datatableWidth
    	});

    	$$self.$inject_state = $$props => {
    		if ("ref" in $$props) $$invalidate(0, ref = $$props.ref);
    		if ("classList" in $$props) $$invalidate(1, classList = $$props.classList);
    		if ("pageCount" in $$props) $$invalidate(2, pageCount = $$props.pageCount);
    		if ("buttons" in $$props) $$invalidate(5, buttons = $$props.buttons);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$rowCount, $options*/ 264) {
    			$$invalidate(2, pageCount = Array.from(Array(Math.ceil($rowCount / $options.rowPerPage)).keys()));
    		}

    		if ($$self.$$.dirty & /*pageCount, $pageNumber*/ 20) {
    			$$invalidate(5, buttons = slice(pageCount, $pageNumber));
    		}
    	};

    	return [
    		ref,
    		classList,
    		pageCount,
    		$options,
    		$pageNumber,
    		buttons,
    		$datatableWidth,
    		setPage,
    		$rowCount,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		click_handler_7,
    		click_handler_8
    	];
    }

    class PaginationButtons extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { ref: 0, classList: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PaginationButtons",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get ref() {
    		throw new Error("<PaginationButtons>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ref(value) {
    		throw new Error("<PaginationButtons>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classList() {
    		throw new Error("<PaginationButtons>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classList(value) {
    		throw new Error("<PaginationButtons>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-simple-datatables/src/components/Pagination.svelte generated by Svelte v3.38.2 */
    const file$7 = "node_modules/svelte-simple-datatables/src/components/Pagination.svelte";

    // (7:0) {#if $options.pagination && ($options.blocks.paginationRowCount || $options.blocks.paginationButtons)}
    function create_if_block$3(ctx) {
    	let section;
    	let current_block_type_index;
    	let if_block0;
    	let t;
    	let current;
    	const if_block_creators = [create_if_block_2$1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$options*/ ctx[0].blocks.paginationRowCount) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let if_block1 = /*$options*/ ctx[0].blocks.paginationButtons && create_if_block_1$2(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			attr_dev(section, "class", "dt-pagination svelte-14lxofj");
    			toggle_class(section, "css", /*$options*/ ctx[0].css);
    			add_location(section, file$7, 7, 4, 315);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			if_blocks[current_block_type_index].m(section, null);
    			append_dev(section, t);
    			if (if_block1) if_block1.m(section, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(section, t);
    			}

    			if (/*$options*/ ctx[0].blocks.paginationButtons) {
    				if (if_block1) {
    					if (dirty & /*$options*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(section, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*$options*/ 1) {
    				toggle_class(section, "css", /*$options*/ ctx[0].css);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if_blocks[current_block_type_index].d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(7:0) {#if $options.pagination && ($options.blocks.paginationRowCount || $options.blocks.paginationButtons)}",
    		ctx
    	});

    	return block;
    }

    // (11:8) {:else}
    function create_else_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			add_location(div, file$7, 11, 12, 488);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(11:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (9:8) {#if $options.blocks.paginationRowCount}
    function create_if_block_2$1(ctx) {
    	let paginationrowcount;
    	let current;
    	paginationrowcount = new PaginationRowCount({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(paginationrowcount.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(paginationrowcount, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paginationrowcount.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paginationrowcount.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(paginationrowcount, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(9:8) {#if $options.blocks.paginationRowCount}",
    		ctx
    	});

    	return block;
    }

    // (14:8) {#if $options.blocks.paginationButtons}
    function create_if_block_1$2(ctx) {
    	let paginationbuttons;
    	let current;
    	paginationbuttons = new PaginationButtons({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(paginationbuttons.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(paginationbuttons, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paginationbuttons.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paginationbuttons.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(paginationbuttons, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(14:8) {#if $options.blocks.paginationButtons}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$options*/ ctx[0].pagination && (/*$options*/ ctx[0].blocks.paginationRowCount || /*$options*/ ctx[0].blocks.paginationButtons) && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$options*/ ctx[0].pagination && (/*$options*/ ctx[0].blocks.paginationRowCount || /*$options*/ ctx[0].blocks.paginationButtons)) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$options*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $options;
    	validate_store(options, "options");
    	component_subscribe($$self, options, $$value => $$invalidate(0, $options = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Pagination", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Pagination> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		PaginationRowCount,
    		PaginationButtons,
    		options,
    		$options
    	});

    	return [$options];
    }

    class Pagination extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Pagination",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    const header = {
        removeOriginalThead: () => {
            setTimeout(() => {
                const thead = document.querySelector('.datatable table thead');
                const originHeight = thead.getBoundingClientRect().height;
                // const tableContainer = document.querySelector('section.datatable .dt-table')
                // const scrollXHeight = tableContainer.offsetHeight - tableContainer.clientHeight
                // - (scrollXHeight > 5 ? scrollXHeight + 10 : 1)
                thead.parentNode.style.marginTop = '-' + (originHeight) + 'px';
                thead.style.visibility = 'hidden';
            }, 50);
        },
        getOrginalTHeadClassList: () => {
            return document.querySelector('.datatable table thead').classList
        },
    };

    /* node_modules/svelte-simple-datatables/src/components/StickyHeader.svelte generated by Svelte v3.38.2 */
    const file$6 = "node_modules/svelte-simple-datatables/src/components/StickyHeader.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (17:12) {#each $columns as th}
    function create_each_block_1(ctx) {
    	let th;
    	let html_tag;
    	let raw_value = /*th*/ ctx[5].html + "";
    	let span;
    	let t;
    	let th_class_value;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[3](/*th*/ ctx[5], ...args);
    	}

    	const block = {
    		c: function create() {
    			th = element("th");
    			span = element("span");
    			t = space();
    			html_tag = new HtmlTag(span);
    			attr_dev(span, "class", "svelte-13x27he");
    			add_location(span, file$6, 24, 35, 911);
    			attr_dev(th, "nowrap", "");
    			set_style(th, "min-width", /*th*/ ctx[5].minWidth + "px");
    			attr_dev(th, "class", th_class_value = "" + (null_to_empty(/*th*/ ctx[5].classList) + " svelte-13x27he"));
    			toggle_class(th, "sortable", /*th*/ ctx[5].key && /*$options*/ ctx[1].sortable === true);
    			add_location(th, file$6, 17, 16, 582);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			html_tag.m(raw_value, th);
    			append_dev(th, span);
    			append_dev(th, t);

    			if (!mounted) {
    				dispose = listen_dev(th, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$columns*/ 4 && raw_value !== (raw_value = /*th*/ ctx[5].html + "")) html_tag.p(raw_value);

    			if (dirty & /*$columns*/ 4) {
    				set_style(th, "min-width", /*th*/ ctx[5].minWidth + "px");
    			}

    			if (dirty & /*$columns*/ 4 && th_class_value !== (th_class_value = "" + (null_to_empty(/*th*/ ctx[5].classList) + " svelte-13x27he"))) {
    				attr_dev(th, "class", th_class_value);
    			}

    			if (dirty & /*$columns, $columns, $options*/ 6) {
    				toggle_class(th, "sortable", /*th*/ ctx[5].key && /*$options*/ ctx[1].sortable === true);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(17:12) {#each $columns as th}",
    		ctx
    	});

    	return block;
    }

    // (29:8) {#if $options.columnFilter === true}
    function create_if_block$2(ctx) {
    	let tr;
    	let each_value = /*$columns*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(tr, file$6, 29, 12, 1038);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$columns, $options, columns*/ 6) {
    				each_value = /*$columns*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tr, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(29:8) {#if $options.columnFilter === true}",
    		ctx
    	});

    	return block;
    }

    // (33:24) {#if th.key}
    function create_if_block_1$1(ctx) {
    	let input;
    	let input_placeholder_value;
    	let mounted;
    	let dispose;

    	function input_handler(...args) {
    		return /*input_handler*/ ctx[4](/*th*/ ctx[5], ...args);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", input_placeholder_value = /*$options*/ ctx[1].labels.filter);
    			attr_dev(input, "class", "browser-default svelte-13x27he");
    			add_location(input, file$6, 33, 28, 1229);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", input_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*$options*/ 2 && input_placeholder_value !== (input_placeholder_value = /*$options*/ ctx[1].labels.filter)) {
    				attr_dev(input, "placeholder", input_placeholder_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(33:24) {#if th.key}",
    		ctx
    	});

    	return block;
    }

    // (31:16) {#each $columns as th}
    function create_each_block$1(ctx) {
    	let th;
    	let t;
    	let if_block = /*th*/ ctx[5].key && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			th = element("th");
    			if (if_block) if_block.c();
    			t = space();
    			attr_dev(th, "class", "filter svelte-13x27he");
    			set_style(th, "width", /*th*/ ctx[5].width);
    			set_style(th, "height", "25px");
    			add_location(th, file$6, 31, 20, 1104);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			if (if_block) if_block.m(th, null);
    			append_dev(th, t);
    		},
    		p: function update(ctx, dirty) {
    			if (/*th*/ ctx[5].key) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					if_block.m(th, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*$columns*/ 4) {
    				set_style(th, "width", /*th*/ ctx[5].width);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(31:16) {#each $columns as th}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let section;
    	let thead;
    	let tr;
    	let t;
    	let thead_class_value;
    	let each_value_1 = /*$columns*/ ctx[2];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let if_block = /*$options*/ ctx[1].columnFilter === true && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			thead = element("thead");
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			if (if_block) if_block.c();
    			add_location(tr, file$6, 15, 8, 524);
    			attr_dev(thead, "class", thead_class_value = "" + (null_to_empty(/*theadClassList*/ ctx[0]) + " svelte-13x27he"));
    			add_location(thead, file$6, 14, 4, 484);
    			attr_dev(section, "class", "dt-header svelte-13x27he");
    			toggle_class(section, "sortable", /*$options*/ ctx[1].sortable === true);
    			toggle_class(section, "css", /*$options*/ ctx[1].css);
    			add_location(section, file$6, 13, 0, 382);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, thead);
    			append_dev(thead, tr);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(thead, t);
    			if (if_block) if_block.m(thead, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$columns, $options, columns*/ 6) {
    				each_value_1 = /*$columns*/ ctx[2];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tr, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (/*$options*/ ctx[1].columnFilter === true) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(thead, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*theadClassList*/ 1 && thead_class_value !== (thead_class_value = "" + (null_to_empty(/*theadClassList*/ ctx[0]) + " svelte-13x27he"))) {
    				attr_dev(thead, "class", thead_class_value);
    			}

    			if (dirty & /*$options*/ 2) {
    				toggle_class(section, "sortable", /*$options*/ ctx[1].sortable === true);
    			}

    			if (dirty & /*$options*/ 2) {
    				toggle_class(section, "css", /*$options*/ ctx[1].css);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $options;
    	let $columns;
    	validate_store(options, "options");
    	component_subscribe($$self, options, $$value => $$invalidate(1, $options = $$value));
    	validate_store(columns, "columns");
    	component_subscribe($$self, columns, $$value => $$invalidate(2, $columns = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("StickyHeader", slots, []);
    	let theadClassList;

    	onMount(() => {
    		columns.draw();
    		header.removeOriginalThead();
    		$$invalidate(0, theadClassList = header.getOrginalTHeadClassList());
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<StickyHeader> was created with unknown prop '${key}'`);
    	});

    	const click_handler = (th, e) => columns.sort(e.target, th.key);
    	const input_handler = (th, e) => columns.filter(th.key, e.target.value);

    	$$self.$capture_state = () => ({
    		options,
    		columns,
    		header,
    		onMount,
    		theadClassList,
    		$options,
    		$columns
    	});

    	$$self.$inject_state = $$props => {
    		if ("theadClassList" in $$props) $$invalidate(0, theadClassList = $$props.theadClassList);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [theadClassList, $options, $columns, click_handler, input_handler];
    }

    class StickyHeader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "StickyHeader",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* node_modules/svelte-simple-datatables/src/Datatable.svelte generated by Svelte v3.38.2 */
    const file$5 = "node_modules/svelte-simple-datatables/src/Datatable.svelte";

    // (20:1) {#if $options.blocks.searchInput === true}
    function create_if_block_2(ctx) {
    	let search;
    	let current;
    	search = new Search({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(search.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(search, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(search.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(search.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(search, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(20:1) {#if $options.blocks.searchInput === true}",
    		ctx
    	});

    	return block;
    }

    // (24:2) {#if $options.scrollY}
    function create_if_block_1(ctx) {
    	let stickyheader;
    	let current;
    	stickyheader = new StickyHeader({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(stickyheader.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(stickyheader, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(stickyheader.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(stickyheader.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(stickyheader, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(24:2) {#if $options.scrollY}",
    		ctx
    	});

    	return block;
    }

    // (31:1) {#if $options.blocks.paginationRowCount === true || $options.blocks.paginationButtons === true}
    function create_if_block$1(ctx) {
    	let pagination;
    	let current;
    	pagination = new Pagination({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(pagination.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(pagination, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pagination.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pagination.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(pagination, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(31:1) {#if $options.blocks.paginationRowCount === true || $options.blocks.paginationButtons === true}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let section;
    	let t0;
    	let article;
    	let t1;
    	let table;
    	let t2;
    	let section_class_value;
    	let current;
    	let if_block0 = /*$options*/ ctx[1].blocks.searchInput === true && create_if_block_2(ctx);
    	let if_block1 = /*$options*/ ctx[1].scrollY && create_if_block_1(ctx);
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);
    	let if_block2 = (/*$options*/ ctx[1].blocks.paginationRowCount === true || /*$options*/ ctx[1].blocks.paginationButtons === true) && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			article = element("article");
    			if (if_block1) if_block1.c();
    			t1 = space();
    			table = element("table");
    			if (default_slot) default_slot.c();
    			t2 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(table, "class", "svelte-1bj54vi");
    			add_location(table, file$5, 26, 2, 801);
    			attr_dev(article, "class", "dt-table svelte-1bj54vi");
    			add_location(article, file$5, 22, 1, 716);
    			attr_dev(section, "class", section_class_value = "datatable " + /*classList*/ ctx[0] + " svelte-1bj54vi");
    			toggle_class(section, "scroll-y", /*$options*/ ctx[1].scrollY);
    			toggle_class(section, "css", /*$options*/ ctx[1].css);
    			add_location(section, file$5, 18, 0, 548);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			if (if_block0) if_block0.m(section, null);
    			append_dev(section, t0);
    			append_dev(section, article);
    			if (if_block1) if_block1.m(article, null);
    			append_dev(article, t1);
    			append_dev(article, table);

    			if (default_slot) {
    				default_slot.m(table, null);
    			}

    			append_dev(section, t2);
    			if (if_block2) if_block2.m(section, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$options*/ ctx[1].blocks.searchInput === true) {
    				if (if_block0) {
    					if (dirty & /*$options*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(section, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*$options*/ ctx[1].scrollY) {
    				if (if_block1) {
    					if (dirty & /*$options*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(article, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[4], dirty, null, null);
    				}
    			}

    			if (/*$options*/ ctx[1].blocks.paginationRowCount === true || /*$options*/ ctx[1].blocks.paginationButtons === true) {
    				if (if_block2) {
    					if (dirty & /*$options*/ 2) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block$1(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(section, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*classList*/ 1 && section_class_value !== (section_class_value = "datatable " + /*classList*/ ctx[0] + " svelte-1bj54vi")) {
    				attr_dev(section, "class", section_class_value);
    			}

    			if (dirty & /*classList, $options*/ 3) {
    				toggle_class(section, "scroll-y", /*$options*/ ctx[1].scrollY);
    			}

    			if (dirty & /*classList, $options*/ 3) {
    				toggle_class(section, "css", /*$options*/ ctx[1].css);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(default_slot, local);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(default_slot, local);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (default_slot) default_slot.d(detaching);
    			if (if_block2) if_block2.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $options;
    	validate_store(options, "options");
    	component_subscribe($$self, options, $$value => $$invalidate(1, $options = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Datatable", slots, ['default']);
    	let { data = [] } = $$props;
    	let { settings = {} } = $$props;
    	let { classList = "" } = $$props;
    	onMount(() => datatable.init());
    	onDestroy(() => datatable.reset());
    	const writable_props = ["data", "settings", "classList"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Datatable> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(2, data = $$props.data);
    		if ("settings" in $$props) $$invalidate(3, settings = $$props.settings);
    		if ("classList" in $$props) $$invalidate(0, classList = $$props.classList);
    		if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		options,
    		datatable,
    		Search,
    		Pagination,
    		StickyHeader,
    		onMount,
    		onDestroy,
    		data,
    		settings,
    		classList,
    		$options
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(2, data = $$props.data);
    		if ("settings" in $$props) $$invalidate(3, settings = $$props.settings);
    		if ("classList" in $$props) $$invalidate(0, classList = $$props.classList);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*data, settings*/ 12) {
    			{
    				datatable.setRows(data);
    				options.update(settings);
    			}
    		}
    	};

    	return [classList, $options, data, settings, $$scope, slots];
    }

    class Datatable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { data: 2, settings: 3, classList: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Datatable",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get data() {
    		throw new Error("<Datatable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Datatable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get settings() {
    		throw new Error("<Datatable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set settings(value) {
    		throw new Error("<Datatable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classList() {
    		throw new Error("<Datatable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classList(value) {
    		throw new Error("<Datatable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* node_modules/@svelte-parts/modal/Modal.svelte generated by Svelte v3.38.2 */
    const file$4 = "node_modules/@svelte-parts/modal/Modal.svelte";

    // (33:0) {#if open}
    function create_if_block(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let div2_transition;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			add_location(div0, file$4, 35, 6, 768);
    			attr_dev(div1, "style", /*style*/ ctx[1].center);
    			add_location(div1, file$4, 34, 4, 735);
    			attr_dev(div2, "style", /*style*/ ctx[1].background);
    			add_location(div2, file$4, 33, 2, 645);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", click_handler, false, false, false),
    					listen_dev(div2, "click", /*close*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[4], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, { duration: 300 }, true);
    				div2_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, { duration: 300 }, false);
    			div2_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div2_transition) div2_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(33:0) {#if open}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*open*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*open*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*open*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const click_handler = e => e.stopPropagation();

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Modal", slots, ['default']);
    	let { open = false } = $$props;

    	let { onClose = () => {
    		
    	} } = $$props;

    	const style = {
    		background: [
    			"display: block",
    			"position: fixed",
    			"z-index: 10",
    			"left: 0",
    			"top: 0",
    			"width: 100vw",
    			"height: 100vh",
    			"overflow: auto",
    			"background-color: rgb(0, 0, 0, 0.8)"
    		].join(";"),
    		center: [
    			"width: 100%",
    			"height: 100%",
    			"display: flex",
    			"justify-content: center",
    			"align-items: center"
    		].join(";")
    	};

    	const close = () => {
    		$$invalidate(0, open = false);

    		if (onClose) {
    			onClose();
    		}
    	};

    	const writable_props = ["open", "onClose"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("open" in $$props) $$invalidate(0, open = $$props.open);
    		if ("onClose" in $$props) $$invalidate(3, onClose = $$props.onClose);
    		if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ fade, open, onClose, style, close });

    	$$self.$inject_state = $$props => {
    		if ("open" in $$props) $$invalidate(0, open = $$props.open);
    		if ("onClose" in $$props) $$invalidate(3, onClose = $$props.onClose);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [open, style, close, onClose, $$scope, slots];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { open: 0, onClose: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get open() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set open(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onClose() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClose(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Boton.svelte generated by Svelte v3.38.2 */
    const file$3 = "src/components/Boton.svelte";

    // (8:4) <Link to="{urlBoton}" class="block px-4 py-2 text-sm text-red-600 hover:text-gray-700 border-red-600 hover:border-gray-700" role="menuitem">
    function create_default_slot$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*tituloBoton*/ ctx[0]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tituloBoton*/ 1) set_data_dev(t, /*tituloBoton*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(8:4) <Link to=\\\"{urlBoton}\\\" class=\\\"block px-4 py-2 text-sm text-red-600 hover:text-gray-700 border-red-600 hover:border-gray-700\\\" role=\\\"menuitem\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let link;
    	let current;

    	link = new Link({
    			props: {
    				to: /*urlBoton*/ ctx[1],
    				class: "block px-4 py-2 text-sm text-red-600 hover:text-gray-700 border-red-600 hover:border-gray-700",
    				role: "menuitem",
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(link.$$.fragment);
    			add_location(div, file$3, 6, 0, 122);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(link, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const link_changes = {};
    			if (dirty & /*urlBoton*/ 2) link_changes.to = /*urlBoton*/ ctx[1];

    			if (dirty & /*$$scope, tituloBoton*/ 5) {
    				link_changes.$$scope = { dirty, ctx };
    			}

    			link.$set(link_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(link);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Boton", slots, []);
    	let { tituloBoton } = $$props;
    	let { urlBoton } = $$props;
    	const writable_props = ["tituloBoton", "urlBoton"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Boton> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("tituloBoton" in $$props) $$invalidate(0, tituloBoton = $$props.tituloBoton);
    		if ("urlBoton" in $$props) $$invalidate(1, urlBoton = $$props.urlBoton);
    	};

    	$$self.$capture_state = () => ({ Link, tituloBoton, urlBoton });

    	$$self.$inject_state = $$props => {
    		if ("tituloBoton" in $$props) $$invalidate(0, tituloBoton = $$props.tituloBoton);
    		if ("urlBoton" in $$props) $$invalidate(1, urlBoton = $$props.urlBoton);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [tituloBoton, urlBoton];
    }

    class Boton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { tituloBoton: 0, urlBoton: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Boton",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*tituloBoton*/ ctx[0] === undefined && !("tituloBoton" in props)) {
    			console.warn("<Boton> was created without expected prop 'tituloBoton'");
    		}

    		if (/*urlBoton*/ ctx[1] === undefined && !("urlBoton" in props)) {
    			console.warn("<Boton> was created without expected prop 'urlBoton'");
    		}
    	}

    	get tituloBoton() {
    		throw new Error("<Boton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tituloBoton(value) {
    		throw new Error("<Boton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get urlBoton() {
    		throw new Error("<Boton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set urlBoton(value) {
    		throw new Error("<Boton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/ModalEditarEmpleado.svelte generated by Svelte v3.38.2 */
    const file$2 = "src/components/ModalEditarEmpleado.svelte";

    // (35:0) <Modal {open} onClose={() => (open = false)}>
    function create_default_slot$2(ctx) {
    	let div16;
    	let form;
    	let div2;
    	let div0;
    	let label0;
    	let t1;
    	let input0;
    	let t2;
    	let div1;
    	let label1;
    	let t4;
    	let input1;
    	let t5;
    	let div5;
    	let div3;
    	let label2;
    	let t7;
    	let input2;
    	let t8;
    	let div4;
    	let label3;
    	let t10;
    	let input3;
    	let t11;
    	let div7;
    	let div6;
    	let label4;
    	let t13;
    	let input4;
    	let t14;
    	let p0;
    	let t16;
    	let div9;
    	let div8;
    	let label5;
    	let t18;
    	let input5;
    	let t19;
    	let p1;
    	let t21;
    	let div15;
    	let div10;
    	let label6;
    	let t23;
    	let input6;
    	let t24;
    	let div13;
    	let label7;
    	let t26;
    	let div12;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let t30;
    	let div11;
    	let svg;
    	let path;
    	let t31;
    	let div14;
    	let label8;
    	let t33;
    	let input7;
    	let t34;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div16 = element("div");
    			form = element("form");
    			div2 = element("div");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Nombre";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Apellido Paterno";
    			t4 = space();
    			input1 = element("input");
    			t5 = space();
    			div5 = element("div");
    			div3 = element("div");
    			label2 = element("label");
    			label2.textContent = "Departamento";
    			t7 = space();
    			input2 = element("input");
    			t8 = space();
    			div4 = element("div");
    			label3 = element("label");
    			label3.textContent = "Puesto";
    			t10 = space();
    			input3 = element("input");
    			t11 = space();
    			div7 = element("div");
    			div6 = element("div");
    			label4 = element("label");
    			label4.textContent = "Fecha de ingreso";
    			t13 = space();
    			input4 = element("input");
    			t14 = space();
    			p0 = element("p");
    			p0.textContent = "Make it as long and as crazy as you'd like";
    			t16 = space();
    			div9 = element("div");
    			div8 = element("div");
    			label5 = element("label");
    			label5.textContent = "Password";
    			t18 = space();
    			input5 = element("input");
    			t19 = space();
    			p1 = element("p");
    			p1.textContent = "Make it as long and as crazy as you'd like";
    			t21 = space();
    			div15 = element("div");
    			div10 = element("div");
    			label6 = element("label");
    			label6.textContent = "City";
    			t23 = space();
    			input6 = element("input");
    			t24 = space();
    			div13 = element("div");
    			label7 = element("label");
    			label7.textContent = "State";
    			t26 = space();
    			div12 = element("div");
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "New Mexico";
    			option1 = element("option");
    			option1.textContent = "Missouri";
    			option2 = element("option");
    			option2.textContent = "Texas";
    			t30 = space();
    			div11 = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t31 = space();
    			div14 = element("div");
    			label8 = element("label");
    			label8.textContent = "Zip";
    			t33 = space();
    			input7 = element("input");
    			t34 = space();
    			button = element("button");
    			button.textContent = "enviar contenido";
    			attr_dev(label0, "class", "block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2");
    			attr_dev(label0, "for", "grid-last-name");
    			add_location(label0, file$2, 39, 10, 1062);
    			attr_dev(input0, "class", "appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500");
    			attr_dev(input0, "id", "grid-last-name");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Doe");
    			add_location(input0, file$2, 45, 10, 1255);
    			attr_dev(div0, "class", "w-full md:w-1/2 px-3");
    			add_location(div0, file$2, 38, 8, 1016);
    			attr_dev(label1, "class", "block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2");
    			attr_dev(label1, "for", "grid-last-name");
    			add_location(label1, file$2, 54, 10, 1656);
    			attr_dev(input1, "class", "appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500");
    			attr_dev(input1, "id", "grid-last-name");
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "placeholder", "Doe");
    			add_location(input1, file$2, 60, 10, 1859);
    			attr_dev(div1, "class", "w-full md:w-1/2 px-3");
    			add_location(div1, file$2, 53, 8, 1610);
    			attr_dev(div2, "class", "flex flex-wrap -mx-3 mb-6");
    			add_location(div2, file$2, 37, 6, 967);
    			attr_dev(label2, "class", "block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2");
    			attr_dev(label2, "for", "grid-last-name");
    			add_location(label2, file$2, 71, 10, 2323);
    			attr_dev(input2, "class", "appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500");
    			attr_dev(input2, "id", "grid-last-name");
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "placeholder", "Doe");
    			add_location(input2, file$2, 77, 10, 2522);
    			attr_dev(div3, "class", "w-full md:w-1/2 px-3");
    			add_location(div3, file$2, 70, 8, 2277);
    			attr_dev(label3, "class", "block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2");
    			attr_dev(label3, "for", "grid-last-name");
    			add_location(label3, file$2, 86, 10, 2928);
    			attr_dev(input3, "class", "appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500");
    			attr_dev(input3, "id", "grid-last-name");
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "placeholder", "Doe");
    			add_location(input3, file$2, 92, 10, 3121);
    			attr_dev(div4, "class", "w-full md:w-1/2 px-3");
    			add_location(div4, file$2, 85, 8, 2882);
    			attr_dev(div5, "class", "flex flex-wrap -mx-3 mb-6");
    			add_location(div5, file$2, 69, 6, 2228);
    			attr_dev(label4, "class", "block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2");
    			attr_dev(label4, "for", "grid-password");
    			add_location(label4, file$2, 103, 10, 3574);
    			attr_dev(input4, "class", "appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500");
    			attr_dev(input4, "id", "grid-password");
    			attr_dev(input4, "type", "date");
    			attr_dev(input4, "placeholder", "");
    			add_location(input4, file$2, 109, 10, 3776);
    			attr_dev(p0, "class", "text-gray-600 text-xs italic");
    			add_location(p0, file$2, 117, 10, 4126);
    			attr_dev(div6, "class", "w-full px-3");
    			add_location(div6, file$2, 102, 8, 3537);
    			attr_dev(div7, "class", "flex flex-wrap -mx-3 mb-6");
    			add_location(div7, file$2, 101, 6, 3488);
    			attr_dev(label5, "class", "block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2");
    			attr_dev(label5, "for", "grid-password");
    			add_location(label5, file$2, 124, 10, 4362);
    			attr_dev(input5, "class", "appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500");
    			attr_dev(input5, "id", "grid-password");
    			attr_dev(input5, "type", "password");
    			attr_dev(input5, "placeholder", "******************");
    			add_location(input5, file$2, 130, 10, 4556);
    			attr_dev(p1, "class", "text-gray-600 text-xs italic");
    			add_location(p1, file$2, 136, 10, 4887);
    			attr_dev(div8, "class", "w-full px-3");
    			add_location(div8, file$2, 123, 8, 4325);
    			attr_dev(div9, "class", "flex flex-wrap -mx-3 mb-6");
    			add_location(div9, file$2, 122, 6, 4276);
    			attr_dev(label6, "class", "block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2");
    			attr_dev(label6, "for", "grid-city");
    			add_location(label6, file$2, 143, 10, 5145);
    			attr_dev(input6, "class", "appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500");
    			attr_dev(input6, "id", "grid-city");
    			attr_dev(input6, "type", "text");
    			attr_dev(input6, "placeholder", "Albuquerque");
    			add_location(input6, file$2, 149, 10, 5331);
    			attr_dev(div10, "class", "w-full md:w-1/3 px-3 mb-6 md:mb-0");
    			add_location(div10, file$2, 142, 8, 5086);
    			attr_dev(label7, "class", "block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2");
    			attr_dev(label7, "for", "grid-state");
    			add_location(label7, file$2, 157, 10, 5715);
    			option0.__value = "New Mexico";
    			option0.value = option0.__value;
    			add_location(option0, file$2, 168, 14, 6202);
    			option1.__value = "Missouri";
    			option1.value = option1.__value;
    			add_location(option1, file$2, 169, 14, 6245);
    			option2.__value = "Texas";
    			option2.value = option2.__value;
    			add_location(option2, file$2, 170, 14, 6286);
    			attr_dev(select, "class", "block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500");
    			attr_dev(select, "id", "grid-state");
    			add_location(select, file$2, 164, 12, 5939);
    			attr_dev(path, "d", "M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z");
    			add_location(path, file$2, 179, 17, 6645);
    			attr_dev(svg, "class", "fill-current h-4 w-4");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			add_location(svg, file$2, 175, 14, 6487);
    			attr_dev(div11, "class", "pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700");
    			add_location(div11, file$2, 172, 12, 6345);
    			attr_dev(div12, "class", "relative");
    			add_location(div12, file$2, 163, 10, 5903);
    			attr_dev(div13, "class", "w-full md:w-1/3 px-3 mb-6 md:mb-0");
    			add_location(div13, file$2, 156, 8, 5656);
    			attr_dev(label8, "class", "block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2");
    			attr_dev(label8, "for", "grid-zip");
    			add_location(label8, file$2, 187, 10, 6913);
    			attr_dev(input7, "class", "appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500");
    			attr_dev(input7, "id", "grid-zip");
    			attr_dev(input7, "type", "text");
    			attr_dev(input7, "placeholder", "90210");
    			add_location(input7, file$2, 193, 10, 7097);
    			attr_dev(div14, "class", "w-full md:w-1/3 px-3 mb-6 md:mb-0");
    			add_location(div14, file$2, 186, 8, 6854);
    			attr_dev(div15, "class", "flex flex-wrap -mx-3 mb-2");
    			add_location(div15, file$2, 141, 6, 5037);
    			attr_dev(form, "class", "w-full max-w-lg");
    			add_location(form, file$2, 36, 4, 929);
    			attr_dev(button, "class", "block px-4 py-2 text-sm text-red-600 hover:text-gray-700 border-red-600 hover:border-gray-700");
    			add_location(button, file$2, 202, 4, 7438);
    			attr_dev(div16, "class", "modal svelte-zqonzt");
    			add_location(div16, file$2, 35, 2, 904);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div16, anchor);
    			append_dev(div16, form);
    			append_dev(form, div2);
    			append_dev(div2, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t1);
    			append_dev(div0, input0);
    			set_input_value(input0, /*nombre*/ ctx[0]);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t4);
    			append_dev(div1, input1);
    			set_input_value(input1, /*aPaterno*/ ctx[1]);
    			append_dev(form, t5);
    			append_dev(form, div5);
    			append_dev(div5, div3);
    			append_dev(div3, label2);
    			append_dev(div3, t7);
    			append_dev(div3, input2);
    			set_input_value(input2, /*dependencia*/ ctx[3]);
    			append_dev(div5, t8);
    			append_dev(div5, div4);
    			append_dev(div4, label3);
    			append_dev(div4, t10);
    			append_dev(div4, input3);
    			set_input_value(input3, /*puesto*/ ctx[4]);
    			append_dev(form, t11);
    			append_dev(form, div7);
    			append_dev(div7, div6);
    			append_dev(div6, label4);
    			append_dev(div6, t13);
    			append_dev(div6, input4);
    			set_input_value(input4, /*fechaIngreso*/ ctx[2]);
    			append_dev(div6, t14);
    			append_dev(div6, p0);
    			append_dev(form, t16);
    			append_dev(form, div9);
    			append_dev(div9, div8);
    			append_dev(div8, label5);
    			append_dev(div8, t18);
    			append_dev(div8, input5);
    			append_dev(div8, t19);
    			append_dev(div8, p1);
    			append_dev(form, t21);
    			append_dev(form, div15);
    			append_dev(div15, div10);
    			append_dev(div10, label6);
    			append_dev(div10, t23);
    			append_dev(div10, input6);
    			append_dev(div15, t24);
    			append_dev(div15, div13);
    			append_dev(div13, label7);
    			append_dev(div13, t26);
    			append_dev(div13, div12);
    			append_dev(div12, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			append_dev(div12, t30);
    			append_dev(div12, div11);
    			append_dev(div11, svg);
    			append_dev(svg, path);
    			append_dev(div15, t31);
    			append_dev(div15, div14);
    			append_dev(div14, label8);
    			append_dev(div14, t33);
    			append_dev(div14, input7);
    			append_dev(div16, t34);
    			append_dev(div16, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[9]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[10]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[11]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[12]),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[13]),
    					listen_dev(button, "click", /*print*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*nombre*/ 1 && input0.value !== /*nombre*/ ctx[0]) {
    				set_input_value(input0, /*nombre*/ ctx[0]);
    			}

    			if (dirty & /*aPaterno*/ 2 && input1.value !== /*aPaterno*/ ctx[1]) {
    				set_input_value(input1, /*aPaterno*/ ctx[1]);
    			}

    			if (dirty & /*dependencia*/ 8 && input2.value !== /*dependencia*/ ctx[3]) {
    				set_input_value(input2, /*dependencia*/ ctx[3]);
    			}

    			if (dirty & /*puesto*/ 16 && input3.value !== /*puesto*/ ctx[4]) {
    				set_input_value(input3, /*puesto*/ ctx[4]);
    			}

    			if (dirty & /*fechaIngreso*/ 4) {
    				set_input_value(input4, /*fechaIngreso*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div16);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(35:0) <Modal {open} onClose={() => (open = false)}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let i;
    	let t;
    	let modal;
    	let current;
    	let mounted;
    	let dispose;

    	modal = new Modal({
    			props: {
    				open: /*open*/ ctx[5],
    				onClose: /*func*/ ctx[14],
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			i = element("i");
    			t = space();
    			create_component(modal.$$.fragment);
    			attr_dev(i, "class", " bi bi-pencil pl-2 block py-1 md:py-3 pl-1 align-middle text-blue-500 no-underline hover:text-gray-400");
    			add_location(i, file$2, 29, 0, 697);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(modal, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(i, "click", /*click_handler*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const modal_changes = {};
    			if (dirty & /*open*/ 32) modal_changes.open = /*open*/ ctx[5];
    			if (dirty & /*open*/ 32) modal_changes.onClose = /*func*/ ctx[14];

    			if (dirty & /*$$scope, fechaIngreso, puesto, dependencia, aPaterno, nombre*/ 32799) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			if (detaching) detach_dev(t);
    			destroy_component(modal, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ModalEditarEmpleado", slots, []);
    	let { nombre } = $$props;
    	let { aPaterno } = $$props;
    	let { fechaIngreso } = $$props;
    	let { dependencia } = $$props;
    	let { puesto } = $$props;
    	let { id } = $$props;
    	let open = false;

    	const print = async () => {
    		const APII = `http://localhost:3000/empleados/edit/${id}`;

    		const putMethod = {
    			method: "PUT", // Method itself
    			headers: {
    				"Content-type": "application/json; charset=UTF-8", // Indicates the content
    				
    			},
    			body: JSON.stringify({ nombre, aPaterno }), // We send data in JSON format
    			
    		};

    		const response = await fetch(APII, putMethod);
    		row = await response.json();
    	};

    	const writable_props = ["nombre", "aPaterno", "fechaIngreso", "dependencia", "puesto", "id"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ModalEditarEmpleado> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(5, open = true);

    	function input0_input_handler() {
    		nombre = this.value;
    		$$invalidate(0, nombre);
    	}

    	function input1_input_handler() {
    		aPaterno = this.value;
    		$$invalidate(1, aPaterno);
    	}

    	function input2_input_handler() {
    		dependencia = this.value;
    		$$invalidate(3, dependencia);
    	}

    	function input3_input_handler() {
    		puesto = this.value;
    		$$invalidate(4, puesto);
    	}

    	function input4_input_handler() {
    		fechaIngreso = this.value;
    		$$invalidate(2, fechaIngreso);
    	}

    	const func = () => $$invalidate(5, open = false);

    	$$self.$$set = $$props => {
    		if ("nombre" in $$props) $$invalidate(0, nombre = $$props.nombre);
    		if ("aPaterno" in $$props) $$invalidate(1, aPaterno = $$props.aPaterno);
    		if ("fechaIngreso" in $$props) $$invalidate(2, fechaIngreso = $$props.fechaIngreso);
    		if ("dependencia" in $$props) $$invalidate(3, dependencia = $$props.dependencia);
    		if ("puesto" in $$props) $$invalidate(4, puesto = $$props.puesto);
    		if ("id" in $$props) $$invalidate(7, id = $$props.id);
    	};

    	$$self.$capture_state = () => ({
    		Modal,
    		nombre,
    		aPaterno,
    		fechaIngreso,
    		dependencia,
    		puesto,
    		id,
    		open,
    		print
    	});

    	$$self.$inject_state = $$props => {
    		if ("nombre" in $$props) $$invalidate(0, nombre = $$props.nombre);
    		if ("aPaterno" in $$props) $$invalidate(1, aPaterno = $$props.aPaterno);
    		if ("fechaIngreso" in $$props) $$invalidate(2, fechaIngreso = $$props.fechaIngreso);
    		if ("dependencia" in $$props) $$invalidate(3, dependencia = $$props.dependencia);
    		if ("puesto" in $$props) $$invalidate(4, puesto = $$props.puesto);
    		if ("id" in $$props) $$invalidate(7, id = $$props.id);
    		if ("open" in $$props) $$invalidate(5, open = $$props.open);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		nombre,
    		aPaterno,
    		fechaIngreso,
    		dependencia,
    		puesto,
    		open,
    		print,
    		id,
    		click_handler,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		func
    	];
    }

    class ModalEditarEmpleado extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			nombre: 0,
    			aPaterno: 1,
    			fechaIngreso: 2,
    			dependencia: 3,
    			puesto: 4,
    			id: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ModalEditarEmpleado",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*nombre*/ ctx[0] === undefined && !("nombre" in props)) {
    			console.warn("<ModalEditarEmpleado> was created without expected prop 'nombre'");
    		}

    		if (/*aPaterno*/ ctx[1] === undefined && !("aPaterno" in props)) {
    			console.warn("<ModalEditarEmpleado> was created without expected prop 'aPaterno'");
    		}

    		if (/*fechaIngreso*/ ctx[2] === undefined && !("fechaIngreso" in props)) {
    			console.warn("<ModalEditarEmpleado> was created without expected prop 'fechaIngreso'");
    		}

    		if (/*dependencia*/ ctx[3] === undefined && !("dependencia" in props)) {
    			console.warn("<ModalEditarEmpleado> was created without expected prop 'dependencia'");
    		}

    		if (/*puesto*/ ctx[4] === undefined && !("puesto" in props)) {
    			console.warn("<ModalEditarEmpleado> was created without expected prop 'puesto'");
    		}

    		if (/*id*/ ctx[7] === undefined && !("id" in props)) {
    			console.warn("<ModalEditarEmpleado> was created without expected prop 'id'");
    		}
    	}

    	get nombre() {
    		throw new Error("<ModalEditarEmpleado>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nombre(value) {
    		throw new Error("<ModalEditarEmpleado>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get aPaterno() {
    		throw new Error("<ModalEditarEmpleado>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set aPaterno(value) {
    		throw new Error("<ModalEditarEmpleado>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fechaIngreso() {
    		throw new Error("<ModalEditarEmpleado>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fechaIngreso(value) {
    		throw new Error("<ModalEditarEmpleado>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dependencia() {
    		throw new Error("<ModalEditarEmpleado>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dependencia(value) {
    		throw new Error("<ModalEditarEmpleado>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get puesto() {
    		throw new Error("<ModalEditarEmpleado>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set puesto(value) {
    		throw new Error("<ModalEditarEmpleado>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<ModalEditarEmpleado>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<ModalEditarEmpleado>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/views/Empleados.svelte generated by Svelte v3.38.2 */
    const file$1 = "src/views/Empleados.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (47:2) <Modal {open} onClose={() => (open = false)}>
    function create_default_slot_1$1(ctx) {
    	let div3;
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let h4;
    	let t1_value = /*row*/ ctx[3].nombre + "";
    	let t1;
    	let t2;
    	let h5;
    	let t3_value = /*row*/ ctx[3].dependencia + "";
    	let t3;
    	let t4;
    	let div2;
    	let q;
    	let t5_value = /*row*/ ctx[3].RFC + "";
    	let t5;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			h4 = element("h4");
    			t1 = text(t1_value);
    			t2 = space();
    			h5 = element("h5");
    			t3 = text(t3_value);
    			t4 = space();
    			div2 = element("div");
    			q = element("q");
    			t5 = text(t5_value);
    			attr_dev(img, "alt", "avatar");
    			attr_dev(img, "class", "w-20 rounded-full border-2 border-gray-300");
    			if (img.src !== (img_src_value = "https://picsum.photos/seed/picsum/200")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$1, 50, 15, 1439);
    			attr_dev(h4, "id", "name");
    			attr_dev(h4, "class", "text-xl font-semibold");
    			add_location(h4, file$1, 52, 18, 1639);
    			attr_dev(h5, "id", "job");
    			attr_dev(h5, "class", "font-semibold text-blue-600");
    			add_location(h5, file$1, 53, 18, 1720);
    			attr_dev(div0, "id", "header-text");
    			attr_dev(div0, "class", "leading-5 ml-6 sm");
    			add_location(div0, file$1, 51, 15, 1571);
    			attr_dev(div1, "id", "header");
    			attr_dev(div1, "class", "flex items-center mb-4");
    			add_location(div1, file$1, 49, 12, 1373);
    			attr_dev(q, "class", "italic text-gray-600");
    			add_location(q, file$1, 57, 15, 1881);
    			attr_dev(div2, "id", "quote");
    			add_location(div2, file$1, 56, 12, 1848);
    			attr_dev(div3, "class", "modal svelte-1p5gznk");
    			add_location(div3, file$1, 47, 4, 1331);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, h4);
    			append_dev(h4, t1);
    			append_dev(div0, t2);
    			append_dev(div0, h5);
    			append_dev(h5, t3);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			append_dev(div2, q);
    			append_dev(q, t5);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*row*/ 8 && t1_value !== (t1_value = /*row*/ ctx[3].nombre + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*row*/ 8 && t3_value !== (t3_value = /*row*/ ctx[3].dependencia + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*row*/ 8 && t5_value !== (t5_value = /*row*/ ctx[3].RFC + "")) set_data_dev(t5, t5_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(47:2) <Modal {open} onClose={() => (open = false)}>",
    		ctx
    	});

    	return block;
    }

    // (89:10) {#each $rows as row}
    function create_each_block(ctx) {
    	let tr;
    	let td0;
    	let span0;
    	let t0_value = /*row*/ ctx[3].nombre + "";
    	let t0;
    	let br0;
    	let t1;
    	let td1;
    	let t2_value = /*row*/ ctx[3].fechaNacimiento + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4;
    	let span1;
    	let t5_value = /*row*/ ctx[3].fechaIngreso + "";
    	let t5;
    	let br1;
    	let t6;
    	let span2;
    	let t7_value = /*row*/ ctx[3].antiguedad + "";
    	let t7;
    	let t8;
    	let td3;
    	let t9;
    	let span3;
    	let t10_value = /*row*/ ctx[3].dependencia + "";
    	let t10;
    	let br2;
    	let t11;
    	let span4;
    	let t12_value = /*row*/ ctx[3].areaPuesto + "";
    	let t12;
    	let t13;
    	let td4;
    	let t14;
    	let span5;
    	let t15_value = /*row*/ ctx[3].RFC + "";
    	let t15;
    	let t16;
    	let br3;
    	let t17;
    	let span6;
    	let t18_value = /*row*/ ctx[3].CURP + "";
    	let t18;
    	let br4;
    	let t19;
    	let span7;
    	let t20_value = /*row*/ ctx[3].NSS + "";
    	let t20;
    	let t21;
    	let td5;
    	let t22_value = /*row*/ ctx[3].SD + "";
    	let t22;
    	let t23;
    	let td6;
    	let t24_value = /*row*/ ctx[3].SDI + "";
    	let t24;
    	let t25;
    	let td7;
    	let t26_value = /*row*/ ctx[3].estado + "";
    	let t26;
    	let t27;
    	let td8;
    	let t28_value = /*row*/ ctx[3].empresa + "";
    	let t28;
    	let t29;
    	let td9;
    	let i0;
    	let t30;
    	let td10;
    	let modaleditarempleado;
    	let t31;
    	let td11;
    	let i1;
    	let t32;
    	let current;
    	let mounted;
    	let dispose;

    	modaleditarempleado = new ModalEditarEmpleado({
    			props: {
    				nombre: /*row*/ ctx[3].nombre,
    				aPaterno: /*row*/ ctx[3].ap_paterno,
    				fechaIngreso: /*row*/ ctx[3].fechaIngreso,
    				dependencia: /*row*/ ctx[3].dependencia,
    				puesto: /*row*/ ctx[3].areaPuesto,
    				id: /*row*/ ctx[3].id_empleado
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			span0 = element("span");
    			t0 = text(t0_value);
    			br0 = element("br");
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text("Ingreso: ");
    			span1 = element("span");
    			t5 = text(t5_value);
    			br1 = element("br");
    			t6 = text("Antiguedad: ");
    			span2 = element("span");
    			t7 = text(t7_value);
    			t8 = space();
    			td3 = element("td");
    			t9 = text("Departamento: ");
    			span3 = element("span");
    			t10 = text(t10_value);
    			br2 = element("br");
    			t11 = text("Puesto: ");
    			span4 = element("span");
    			t12 = text(t12_value);
    			t13 = space();
    			td4 = element("td");
    			t14 = text("RFC: ");
    			span5 = element("span");
    			t15 = text(t15_value);
    			t16 = space();
    			br3 = element("br");
    			t17 = text("CURP:  ");
    			span6 = element("span");
    			t18 = text(t18_value);
    			br4 = element("br");
    			t19 = text("NSS: ");
    			span7 = element("span");
    			t20 = text(t20_value);
    			t21 = space();
    			td5 = element("td");
    			t22 = text(t22_value);
    			t23 = space();
    			td6 = element("td");
    			t24 = text(t24_value);
    			t25 = space();
    			td7 = element("td");
    			t26 = text(t26_value);
    			t27 = space();
    			td8 = element("td");
    			t28 = text(t28_value);
    			t29 = space();
    			td9 = element("td");
    			i0 = element("i");
    			t30 = space();
    			td10 = element("td");
    			create_component(modaleditarempleado.$$.fragment);
    			t31 = space();
    			td11 = element("td");
    			i1 = element("i");
    			t32 = space();
    			attr_dev(span0, "class", "text-red-500 no-underline hover:text-gray-400");
    			add_location(span0, file$1, 90, 18, 3174);
    			add_location(br0, file$1, 90, 106, 3262);
    			attr_dev(td0, "class", "svelte-1p5gznk");
    			add_location(td0, file$1, 90, 14, 3170);
    			attr_dev(td1, "class", "text-gray-500 svelte-1p5gznk");
    			add_location(td1, file$1, 91, 14, 3287);
    			attr_dev(span1, "class", "text-gray-500");
    			add_location(span1, file$1, 92, 27, 3368);
    			add_location(br1, file$1, 92, 90, 3431);
    			attr_dev(span2, "class", "text-gray-500");
    			add_location(span2, file$1, 92, 106, 3447);
    			attr_dev(td2, "class", "svelte-1p5gznk");
    			add_location(td2, file$1, 92, 14, 3355);
    			attr_dev(span3, "class", "text-gray-500");
    			add_location(span3, file$1, 93, 32, 3548);
    			add_location(br2, file$1, 93, 94, 3610);
    			attr_dev(span4, "class", "text-gray-500");
    			add_location(span4, file$1, 93, 106, 3622);
    			attr_dev(td3, "class", "svelte-1p5gznk");
    			add_location(td3, file$1, 93, 14, 3530);
    			attr_dev(span5, "class", "text-gray-500");
    			add_location(span5, file$1, 94, 23, 3713);
    			add_location(br3, file$1, 94, 78, 3768);
    			attr_dev(span6, "class", "text-gray-500");
    			add_location(span6, file$1, 94, 89, 3779);
    			add_location(br4, file$1, 94, 143, 3833);
    			attr_dev(span7, "class", "text-gray-500");
    			add_location(span7, file$1, 94, 152, 3842);
    			attr_dev(td4, "class", "svelte-1p5gznk");
    			add_location(td4, file$1, 94, 14, 3704);
    			attr_dev(td5, "class", "text-gray-500 svelte-1p5gznk");
    			add_location(td5, file$1, 95, 14, 3916);
    			attr_dev(td6, "class", "text-gray-500 svelte-1p5gznk");
    			add_location(td6, file$1, 96, 14, 3971);
    			attr_dev(td7, "class", "text-gray-500 svelte-1p5gznk");
    			add_location(td7, file$1, 97, 14, 4027);
    			attr_dev(td8, "class", "text-gray-500 svelte-1p5gznk");
    			add_location(td8, file$1, 98, 14, 4086);
    			attr_dev(i0, "class", " bi bi-eye-fill pl-2 block py-1 md:py-3 pl-1 align-middle text-green-500 no-underline hover:text-gray-400");
    			add_location(i0, file$1, 101, 16, 4202);
    			attr_dev(td9, "class", "centrar svelte-1p5gznk");
    			add_location(td9, file$1, 99, 14, 4146);
    			attr_dev(td10, "class", "centrar svelte-1p5gznk");
    			add_location(td10, file$1, 103, 14, 4394);
    			attr_dev(i1, "class", "bi bi-trash pl-2 block py-1 md:py-3 pl-1 align-middle text-red-500 no-underline hover:text-gray-400");
    			add_location(i1, file$1, 108, 16, 4708);
    			attr_dev(td11, "class", "centrar svelte-1p5gznk");
    			add_location(td11, file$1, 107, 14, 4670);
    			add_location(tr, file$1, 89, 12, 3150);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, span0);
    			append_dev(span0, t0);
    			append_dev(td0, br0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(td2, span1);
    			append_dev(span1, t5);
    			append_dev(td2, br1);
    			append_dev(td2, t6);
    			append_dev(td2, span2);
    			append_dev(span2, t7);
    			append_dev(tr, t8);
    			append_dev(tr, td3);
    			append_dev(td3, t9);
    			append_dev(td3, span3);
    			append_dev(span3, t10);
    			append_dev(td3, br2);
    			append_dev(td3, t11);
    			append_dev(td3, span4);
    			append_dev(span4, t12);
    			append_dev(tr, t13);
    			append_dev(tr, td4);
    			append_dev(td4, t14);
    			append_dev(td4, span5);
    			append_dev(span5, t15);
    			append_dev(td4, t16);
    			append_dev(td4, br3);
    			append_dev(td4, t17);
    			append_dev(td4, span6);
    			append_dev(span6, t18);
    			append_dev(td4, br4);
    			append_dev(td4, t19);
    			append_dev(td4, span7);
    			append_dev(span7, t20);
    			append_dev(tr, t21);
    			append_dev(tr, td5);
    			append_dev(td5, t22);
    			append_dev(tr, t23);
    			append_dev(tr, td6);
    			append_dev(td6, t24);
    			append_dev(tr, t25);
    			append_dev(tr, td7);
    			append_dev(td7, t26);
    			append_dev(tr, t27);
    			append_dev(tr, td8);
    			append_dev(td8, t28);
    			append_dev(tr, t29);
    			append_dev(tr, td9);
    			append_dev(td9, i0);
    			append_dev(tr, t30);
    			append_dev(tr, td10);
    			mount_component(modaleditarempleado, td10, null);
    			append_dev(tr, t31);
    			append_dev(tr, td11);
    			append_dev(td11, i1);
    			append_dev(tr, t32);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(
    					i0,
    					"click",
    					function () {
    						if (is_function(/*getUser*/ ctx[5](/*row*/ ctx[3].id_empleado))) /*getUser*/ ctx[5](/*row*/ ctx[3].id_empleado).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*$rows*/ 4) && t0_value !== (t0_value = /*row*/ ctx[3].nombre + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*$rows*/ 4) && t2_value !== (t2_value = /*row*/ ctx[3].fechaNacimiento + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*$rows*/ 4) && t5_value !== (t5_value = /*row*/ ctx[3].fechaIngreso + "")) set_data_dev(t5, t5_value);
    			if ((!current || dirty & /*$rows*/ 4) && t7_value !== (t7_value = /*row*/ ctx[3].antiguedad + "")) set_data_dev(t7, t7_value);
    			if ((!current || dirty & /*$rows*/ 4) && t10_value !== (t10_value = /*row*/ ctx[3].dependencia + "")) set_data_dev(t10, t10_value);
    			if ((!current || dirty & /*$rows*/ 4) && t12_value !== (t12_value = /*row*/ ctx[3].areaPuesto + "")) set_data_dev(t12, t12_value);
    			if ((!current || dirty & /*$rows*/ 4) && t15_value !== (t15_value = /*row*/ ctx[3].RFC + "")) set_data_dev(t15, t15_value);
    			if ((!current || dirty & /*$rows*/ 4) && t18_value !== (t18_value = /*row*/ ctx[3].CURP + "")) set_data_dev(t18, t18_value);
    			if ((!current || dirty & /*$rows*/ 4) && t20_value !== (t20_value = /*row*/ ctx[3].NSS + "")) set_data_dev(t20, t20_value);
    			if ((!current || dirty & /*$rows*/ 4) && t22_value !== (t22_value = /*row*/ ctx[3].SD + "")) set_data_dev(t22, t22_value);
    			if ((!current || dirty & /*$rows*/ 4) && t24_value !== (t24_value = /*row*/ ctx[3].SDI + "")) set_data_dev(t24, t24_value);
    			if ((!current || dirty & /*$rows*/ 4) && t26_value !== (t26_value = /*row*/ ctx[3].estado + "")) set_data_dev(t26, t26_value);
    			if ((!current || dirty & /*$rows*/ 4) && t28_value !== (t28_value = /*row*/ ctx[3].empresa + "")) set_data_dev(t28, t28_value);
    			const modaleditarempleado_changes = {};
    			if (dirty & /*$rows*/ 4) modaleditarempleado_changes.nombre = /*row*/ ctx[3].nombre;
    			if (dirty & /*$rows*/ 4) modaleditarempleado_changes.aPaterno = /*row*/ ctx[3].ap_paterno;
    			if (dirty & /*$rows*/ 4) modaleditarempleado_changes.fechaIngreso = /*row*/ ctx[3].fechaIngreso;
    			if (dirty & /*$rows*/ 4) modaleditarempleado_changes.dependencia = /*row*/ ctx[3].dependencia;
    			if (dirty & /*$rows*/ 4) modaleditarempleado_changes.puesto = /*row*/ ctx[3].areaPuesto;
    			if (dirty & /*$rows*/ 4) modaleditarempleado_changes.id = /*row*/ ctx[3].id_empleado;
    			modaleditarempleado.$set(modaleditarempleado_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modaleditarempleado.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modaleditarempleado.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_component(modaleditarempleado);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(89:10) {#each $rows as row}",
    		ctx
    	});

    	return block;
    }

    // (72:6) <Datatable {settings} {data} class="tabla" style="height: 300px;">
    function create_default_slot$1(ctx) {
    	let thead;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let th4;
    	let t9;
    	let th5;
    	let t11;
    	let th6;
    	let t13;
    	let th7;
    	let t15;
    	let th8;
    	let t17;
    	let th9;
    	let t19;
    	let th10;
    	let t21;
    	let th11;
    	let t23;
    	let tbody;
    	let current;
    	let each_value = /*$rows*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			thead = element("thead");
    			th0 = element("th");
    			th0.textContent = "NOMBRE";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "FECHA DE NACIMIENTO";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "ANTIGUEDAD";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "DEPARTAMENTO";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "RFC, CURP, NSS";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "SD";
    			t11 = space();
    			th6 = element("th");
    			th6.textContent = "SDI";
    			t13 = space();
    			th7 = element("th");
    			th7.textContent = "ESTADO";
    			t15 = space();
    			th8 = element("th");
    			th8.textContent = "EMPRESA";
    			t17 = space();
    			th9 = element("th");
    			th9.textContent = "Ver";
    			t19 = space();
    			th10 = element("th");
    			th10.textContent = "Editar";
    			t21 = space();
    			th11 = element("th");
    			th11.textContent = "Eliminar";
    			t23 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(th0, "data-key", "nombre");
    			attr_dev(th0, "class", "svelte-1p5gznk");
    			add_location(th0, file$1, 73, 10, 2498);
    			attr_dev(th1, "data-key", "fechaNacimiento");
    			attr_dev(th1, "class", "svelte-1p5gznk");
    			add_location(th1, file$1, 74, 10, 2543);
    			attr_dev(th2, "data-key", "antiguedad");
    			attr_dev(th2, "class", "svelte-1p5gznk");
    			add_location(th2, file$1, 75, 10, 2610);
    			attr_dev(th3, "data-key", "dependencia");
    			attr_dev(th3, "class", "svelte-1p5gznk");
    			add_location(th3, file$1, 76, 10, 2663);
    			attr_dev(th4, "data-key", "RFC");
    			attr_dev(th4, "class", "svelte-1p5gznk");
    			add_location(th4, file$1, 77, 10, 2719);
    			attr_dev(th5, "data-key", "SD");
    			attr_dev(th5, "class", "svelte-1p5gznk");
    			add_location(th5, file$1, 78, 10, 2769);
    			attr_dev(th6, "data-key", "SDI");
    			attr_dev(th6, "class", "svelte-1p5gznk");
    			add_location(th6, file$1, 79, 10, 2806);
    			attr_dev(th7, "data-key", "estado");
    			attr_dev(th7, "class", "svelte-1p5gznk");
    			add_location(th7, file$1, 80, 10, 2845);
    			attr_dev(th8, "data-key", "empresa");
    			attr_dev(th8, "class", "svelte-1p5gznk");
    			add_location(th8, file$1, 81, 10, 2890);
    			attr_dev(th9, "data-key", "SDI");
    			attr_dev(th9, "class", "svelte-1p5gznk");
    			add_location(th9, file$1, 82, 10, 2937);
    			attr_dev(th10, "data-key", "estado");
    			attr_dev(th10, "class", "svelte-1p5gznk");
    			add_location(th10, file$1, 83, 10, 2976);
    			attr_dev(th11, "data-key", "empresa");
    			attr_dev(th11, "class", "svelte-1p5gznk");
    			add_location(th11, file$1, 84, 10, 3021);
    			add_location(thead, file$1, 72, 8, 2479);
    			add_location(tbody, file$1, 87, 8, 3097);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, thead, anchor);
    			append_dev(thead, th0);
    			append_dev(thead, t1);
    			append_dev(thead, th1);
    			append_dev(thead, t3);
    			append_dev(thead, th2);
    			append_dev(thead, t5);
    			append_dev(thead, th3);
    			append_dev(thead, t7);
    			append_dev(thead, th4);
    			append_dev(thead, t9);
    			append_dev(thead, th5);
    			append_dev(thead, t11);
    			append_dev(thead, th6);
    			append_dev(thead, t13);
    			append_dev(thead, th7);
    			append_dev(thead, t15);
    			append_dev(thead, th8);
    			append_dev(thead, t17);
    			append_dev(thead, th9);
    			append_dev(thead, t19);
    			append_dev(thead, th10);
    			append_dev(thead, t21);
    			append_dev(thead, th11);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, tbody, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$rows, getUser*/ 36) {
    				each_value = /*$rows*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(thead);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(tbody);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(72:6) <Datatable {settings} {data} class=\\\"tabla\\\" style=\\\"height: 300px;\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let modal;
    	let t0;
    	let navbar;
    	let t1;
    	let div2;
    	let div0;
    	let boton;
    	let t2;
    	let titulo;
    	let t3;
    	let div1;
    	let datatable;
    	let current;

    	modal = new Modal({
    			props: {
    				open: /*open*/ ctx[0],
    				onClose: /*func*/ ctx[6],
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	navbar = new Navbar({ $$inline: true });

    	boton = new Boton({
    			props: {
    				urlBoton: "/vacaciones",
    				tituloBoton: "Nuevo empleado"
    			},
    			$$inline: true
    		});

    	titulo = new Titulo({
    			props: { tituloPrincipal: "Empleados" },
    			$$inline: true
    		});

    	datatable = new Datatable({
    			props: {
    				settings: /*settings*/ ctx[4],
    				data: /*data*/ ctx[1],
    				class: "tabla",
    				style: "height: 300px;",
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    			t0 = space();
    			create_component(navbar.$$.fragment);
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			create_component(boton.$$.fragment);
    			t2 = space();
    			create_component(titulo.$$.fragment);
    			t3 = space();
    			div1 = element("div");
    			create_component(datatable.$$.fragment);
    			attr_dev(div0, "class", "origin-top-right absolute right-0 mt-4 mr-5 w-30 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5");
    			attr_dev(div0, "aria-labelledby", "mobile-menu");
    			attr_dev(div0, "role", "menu");
    			add_location(div0, file$1, 66, 4, 2023);
    			attr_dev(div1, "class", "w-auto md:w-5/5 xl:w-5/5  md:ml-40 md:mr-6 mt-6");
    			add_location(div1, file$1, 70, 4, 2334);
    			attr_dev(div2, "class", "row");
    			add_location(div2, file$1, 65, 2, 2000);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			mount_component(boton, div0, null);
    			append_dev(div2, t2);
    			mount_component(titulo, div2, null);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			mount_component(datatable, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const modal_changes = {};
    			if (dirty & /*open*/ 1) modal_changes.open = /*open*/ ctx[0];
    			if (dirty & /*open*/ 1) modal_changes.onClose = /*func*/ ctx[6];

    			if (dirty & /*$$scope, row*/ 520) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    			const datatable_changes = {};
    			if (dirty & /*data*/ 2) datatable_changes.data = /*data*/ ctx[1];

    			if (dirty & /*$$scope, $rows*/ 516) {
    				datatable_changes.$$scope = { dirty, ctx };
    			}

    			datatable.$set(datatable_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			transition_in(navbar.$$.fragment, local);
    			transition_in(boton.$$.fragment, local);
    			transition_in(titulo.$$.fragment, local);
    			transition_in(datatable.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			transition_out(navbar.$$.fragment, local);
    			transition_out(boton.$$.fragment, local);
    			transition_out(titulo.$$.fragment, local);
    			transition_out(datatable.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			destroy_component(boton);
    			destroy_component(titulo);
    			destroy_component(datatable);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const API = "http://206.189.207.78:3000/empleados";

    function instance$1($$self, $$props, $$invalidate) {
    	let $rows;
    	validate_store(rows, "rows");
    	component_subscribe($$self, rows, $$value => $$invalidate(2, $rows = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Empleados", slots, []);
    	let open = false;
    	let row = {};
    	let data = [];

    	onMount(async () => {
    		const response = await fetch(API);
    		$$invalidate(1, data = await response.json());
    	});

    	const settings = {
    		columnFilter: true,
    		labels: {
    			noRows: "No se encontro  registro",
    			search: "Buscar Resgistro", // search input placeholer
    			filter: "Filter", // filter inputs placeholder
    			info: "Total: {rows} Registros Encontrados",
    			previous: "Anterior",
    			next: "Siguiente"
    		},
    		scrollY: false
    	};

    	const getUser = async id => {
    		const APII = `http://206.189.207.78:3000/empleados/${id}`;
    		const response = await fetch(APII);
    		$$invalidate(3, row = await response.json());
    		$$invalidate(0, open = true);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Empleados> was created with unknown prop '${key}'`);
    	});

    	const func = () => $$invalidate(0, open = false);

    	$$self.$capture_state = () => ({
    		onMount,
    		Datatable,
    		rows,
    		Modal,
    		Titulo,
    		Boton,
    		Navbar,
    		ModalEditarEmpleado,
    		open,
    		row,
    		data,
    		API,
    		settings,
    		getUser,
    		$rows
    	});

    	$$self.$inject_state = $$props => {
    		if ("open" in $$props) $$invalidate(0, open = $$props.open);
    		if ("row" in $$props) $$invalidate(3, row = $$props.row);
    		if ("data" in $$props) $$invalidate(1, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [open, data, $rows, row, settings, getUser, func];
    }

    class Empleados extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Empleados",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.38.2 */
    const file = "src/App.svelte";

    // (18:3) <Route path="/">
    function create_default_slot_3(ctx) {
    	let empleados;
    	let current;
    	empleados = new Empleados({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(empleados.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(empleados, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(empleados.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(empleados.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(empleados, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(18:3) <Route path=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (21:3) <Route path="/agenda">
    function create_default_slot_2(ctx) {
    	let agenda;
    	let current;
    	agenda = new Agenda({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(agenda.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(agenda, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(agenda.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(agenda.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(agenda, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(21:3) <Route path=\\\"/agenda\\\">",
    		ctx
    	});

    	return block;
    }

    // (24:3) <Route path="/empleados">
    function create_default_slot_1(ctx) {
    	let empleados;
    	let current;
    	empleados = new Empleados({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(empleados.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(empleados, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(empleados.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(empleados.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(empleados, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(24:3) <Route path=\\\"/empleados\\\">",
    		ctx
    	});

    	return block;
    }

    // (17:2) <Router>
    function create_default_slot(ctx) {
    	let route0;
    	let t0;
    	let route1;
    	let t1;
    	let route2;
    	let current;

    	route0 = new Route({
    			props: {
    				path: "/",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route1 = new Route({
    			props: {
    				path: "/agenda",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route2 = new Route({
    			props: {
    				path: "/empleados",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route0.$$.fragment);
    			t0 = space();
    			create_component(route1.$$.fragment);
    			t1 = space();
    			create_component(route2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(route1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(route2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				route0_changes.$$scope = { dirty, ctx };
    			}

    			route0.$set(route0_changes);
    			const route1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				route1_changes.$$scope = { dirty, ctx };
    			}

    			route1.$set(route1_changes);
    			const route2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				route2_changes.$$scope = { dirty, ctx };
    			}

    			route2.$set(route2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(route1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(route2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(17:2) <Router>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let router;
    	let current;

    	router = new Router({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(router.$$.fragment);
    			add_location(div, file, 14, 1, 199);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(router, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const router_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(router);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Router, Link, Route, Agenda, Empleados });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
