
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35733/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
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
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
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
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
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
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
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
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
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
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
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
            managed_styles.forEach(info => {
                const { stylesheet } = info;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                info.rules = {};
            });
            managed_styles.clear();
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
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
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
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
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
        seen_callbacks.clear();
        set_current_component(saved_component);
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
        else if (callback) {
            callback();
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
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
            const d = (program.b - t);
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

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
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
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
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
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.49.0' }, detail), { bubbles: true }));
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

    /* node_modules/svelte-icons/components/IconBase.svelte generated by Svelte v3.49.0 */

    const file$d = "node_modules/svelte-icons/components/IconBase.svelte";

    // (18:2) {#if title}
    function create_if_block$2(ctx) {
    	let title_1;
    	let t;

    	const block = {
    		c: function create() {
    			title_1 = svg_element("title");
    			t = text(/*title*/ ctx[0]);
    			add_location(title_1, file$d, 18, 4, 298);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title_1, anchor);
    			append_dev(title_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 1) set_data_dev(t, /*title*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(18:2) {#if title}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let svg;
    	let if_block_anchor;
    	let current;
    	let if_block = /*title*/ ctx[0] && create_if_block$2(ctx);
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			if (default_slot) default_slot.c();
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", /*viewBox*/ ctx[1]);
    			attr_dev(svg, "class", "svelte-c8tyih");
    			add_location(svg, file$d, 16, 0, 229);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			if (if_block) if_block.m(svg, null);
    			append_dev(svg, if_block_anchor);

    			if (default_slot) {
    				default_slot.m(svg, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*title*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(svg, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*viewBox*/ 2) {
    				attr_dev(svg, "viewBox", /*viewBox*/ ctx[1]);
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
    			if (detaching) detach_dev(svg);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
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
    	validate_slots('IconBase', slots, ['default']);
    	let { title = null } = $$props;
    	let { viewBox } = $$props;
    	const writable_props = ['title', 'viewBox'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<IconBase> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('viewBox' in $$props) $$invalidate(1, viewBox = $$props.viewBox);
    		if ('$$scope' in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ title, viewBox });

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('viewBox' in $$props) $$invalidate(1, viewBox = $$props.viewBox);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, viewBox, $$scope, slots];
    }

    class IconBase extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { title: 0, viewBox: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "IconBase",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*viewBox*/ ctx[1] === undefined && !('viewBox' in props)) {
    			console.warn("<IconBase> was created without expected prop 'viewBox'");
    		}
    	}

    	get title() {
    		throw new Error("<IconBase>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<IconBase>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get viewBox() {
    		throw new Error("<IconBase>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set viewBox(value) {
    		throw new Error("<IconBase>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-icons/md/MdMenu.svelte generated by Svelte v3.49.0 */
    const file$c = "node_modules/svelte-icons/md/MdMenu.svelte";

    // (4:8) <IconBase viewBox="0 0 24 24" {...$$props}>
    function create_default_slot$4(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z");
    			add_location(path, file$c, 4, 10, 151);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 24 24\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let iconbase;
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 24 24" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$4] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
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
    	validate_slots('MdMenu', slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class MdMenu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MdMenu",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* node_modules/svelte-icons/md/MdClose.svelte generated by Svelte v3.49.0 */
    const file$b = "node_modules/svelte-icons/md/MdClose.svelte";

    // (4:8) <IconBase viewBox="0 0 24 24" {...$$props}>
    function create_default_slot$3(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z");
    			add_location(path, file$b, 4, 10, 151);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 24 24\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let iconbase;
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 24 24" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$3] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MdClose', slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class MdClose extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MdClose",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/components/menu.svelte generated by Svelte v3.49.0 */
    const file$a = "src/components/menu.svelte";

    // (50:4) {:else}
    function create_else_block$1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "img/menuShoe.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "svelte-1f088bq");
    			add_location(img, file$a, 50, 8, 729);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(50:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (48:4) {#if menuOpen}
    function create_if_block_1$1(ctx) {
    	let mdclose;
    	let current;
    	mdclose = new MdClose({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(mdclose.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(mdclose, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mdclose.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mdclose.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(mdclose, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(48:4) {#if menuOpen}",
    		ctx
    	});

    	return block;
    }

    // (54:4) {#if menuOpen}
    function create_if_block$1(ctx) {
    	let div;
    	let nav;
    	let li0;
    	let a0;
    	let t1;
    	let li1;
    	let a1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			nav = element("nav");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "Home";
    			t1 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "About";
    			attr_dev(a0, "class", "svelte-1f088bq");
    			add_location(a0, file$a, 56, 16, 841);
    			attr_dev(li0, "class", "svelte-1f088bq");
    			add_location(li0, file$a, 56, 12, 837);
    			attr_dev(a1, "class", "svelte-1f088bq");
    			add_location(a1, file$a, 57, 16, 874);
    			attr_dev(li1, "class", "svelte-1f088bq");
    			add_location(li1, file$a, 57, 12, 870);
    			add_location(nav, file$a, 55, 8, 819);
    			attr_dev(div, "class", "menu svelte-1f088bq");
    			add_location(div, file$a, 54, 4, 792);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, nav);
    			append_dev(nav, li0);
    			append_dev(li0, a0);
    			append_dev(nav, t1);
    			append_dev(nav, li1);
    			append_dev(li1, a1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(54:4) {#if menuOpen}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block0;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block_1$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*menuOpen*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let if_block1 = /*menuOpen*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div, "class", "menu-icon svelte-1f088bq");
    			add_location(div, file$a, 46, 0, 624);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			append_dev(div, t);
    			if (if_block1) if_block1.m(div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*MenuToggle*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
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
    				if_block0.m(div, t);
    			}

    			if (/*menuOpen*/ ctx[0]) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			dispose();
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Menu', slots, []);
    	let menuOpen = false;

    	let MenuToggle = () => {
    		$$invalidate(0, menuOpen = !menuOpen);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ MdMenu, MdClose, menuOpen, MenuToggle });

    	$$self.$inject_state = $$props => {
    		if ('menuOpen' in $$props) $$invalidate(0, menuOpen = $$props.menuOpen);
    		if ('MenuToggle' in $$props) $$invalidate(1, MenuToggle = $$props.MenuToggle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [menuOpen, MenuToggle];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/scenes/scene1.svelte generated by Svelte v3.49.0 */

    const file$9 = "src/scenes/scene1.svelte";

    function create_fragment$9(ctx) {
    	let video;
    	let source;
    	let source_src_value;
    	let t0;
    	let t1;
    	let div;
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			video = element("video");
    			source = element("source");
    			t0 = text("\n  Your browser does not support the video tag.");
    			t1 = space();
    			div = element("div");
    			img = element("img");
    			if (!src_url_equal(source.src, source_src_value = "/video/Scene01.m4v")) attr_dev(source, "src", source_src_value);
    			attr_dev(source, "type", "video/mp4");
    			add_location(source, file$9, 7, 4, 137);
    			attr_dev(video, "class", "Scene01 svelte-1l4h7n5");
    			video.autoplay = true;
    			add_location(video, file$9, 6, 0, 73);
    			attr_dev(img, "class", "skip svelte-1l4h7n5");
    			if (!src_url_equal(img.src, img_src_value = "img/skipIntro.png")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$9, 11, 7, 255);
    			add_location(div, file$9, 11, 2, 250);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, video, anchor);
    			append_dev(video, source);
    			append_dev(video, t0);
    			/*video_binding*/ ctx[2](video);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, img);

    			if (!mounted) {
    				dispose = listen_dev(img, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(video);
    			/*video_binding*/ ctx[2](null);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Scene1', slots, []);
    	let { videoElement } = $$props;
    	let { currentScene } = $$props;
    	const writable_props = ['videoElement', 'currentScene'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Scene1> was created with unknown prop '${key}'`);
    	});

    	function video_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			videoElement = $$value;
    			$$invalidate(0, videoElement);
    		});
    	}

    	const click_handler = () => {
    		$$invalidate(1, currentScene = 1);
    	};

    	$$self.$$set = $$props => {
    		if ('videoElement' in $$props) $$invalidate(0, videoElement = $$props.videoElement);
    		if ('currentScene' in $$props) $$invalidate(1, currentScene = $$props.currentScene);
    	};

    	$$self.$capture_state = () => ({ videoElement, currentScene });

    	$$self.$inject_state = $$props => {
    		if ('videoElement' in $$props) $$invalidate(0, videoElement = $$props.videoElement);
    		if ('currentScene' in $$props) $$invalidate(1, currentScene = $$props.currentScene);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [videoElement, currentScene, video_binding, click_handler];
    }

    class Scene1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { videoElement: 0, currentScene: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Scene1",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*videoElement*/ ctx[0] === undefined && !('videoElement' in props)) {
    			console.warn("<Scene1> was created without expected prop 'videoElement'");
    		}

    		if (/*currentScene*/ ctx[1] === undefined && !('currentScene' in props)) {
    			console.warn("<Scene1> was created without expected prop 'currentScene'");
    		}
    	}

    	get videoElement() {
    		throw new Error("<Scene1>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set videoElement(value) {
    		throw new Error("<Scene1>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentScene() {
    		throw new Error("<Scene1>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentScene(value) {
    		throw new Error("<Scene1>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/scenes/scene2.svelte generated by Svelte v3.49.0 */

    const file$8 = "src/scenes/scene2.svelte";

    function create_fragment$8(ctx) {
    	let video;
    	let source;
    	let source_src_value;
    	let t;

    	const block = {
    		c: function create() {
    			video = element("video");
    			source = element("source");
    			t = text("\n  Your browser does not support the video tag.");
    			if (!src_url_equal(source.src, source_src_value = "/video/Scene02.m4v")) attr_dev(source, "src", source_src_value);
    			attr_dev(source, "type", "video/mp4");
    			add_location(source, file$8, 7, 4, 114);
    			attr_dev(video, "class", "Scene02 svelte-bns05s");
    			video.autoplay = true;
    			add_location(video, file$8, 6, 0, 50);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, video, anchor);
    			append_dev(video, source);
    			append_dev(video, t);
    			/*video_binding*/ ctx[1](video);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(video);
    			/*video_binding*/ ctx[1](null);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Scene2', slots, []);
    	let { videoElement } = $$props;
    	const writable_props = ['videoElement'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Scene2> was created with unknown prop '${key}'`);
    	});

    	function video_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			videoElement = $$value;
    			$$invalidate(0, videoElement);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('videoElement' in $$props) $$invalidate(0, videoElement = $$props.videoElement);
    	};

    	$$self.$capture_state = () => ({ videoElement });

    	$$self.$inject_state = $$props => {
    		if ('videoElement' in $$props) $$invalidate(0, videoElement = $$props.videoElement);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [videoElement, video_binding];
    }

    class Scene2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { videoElement: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Scene2",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*videoElement*/ ctx[0] === undefined && !('videoElement' in props)) {
    			console.warn("<Scene2> was created without expected prop 'videoElement'");
    		}
    	}

    	get videoElement() {
    		throw new Error("<Scene2>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set videoElement(value) {
    		throw new Error("<Scene2>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/scenes/scene3.svelte generated by Svelte v3.49.0 */

    const file$7 = "src/scenes/scene3.svelte";

    function create_fragment$7(ctx) {
    	let video;
    	let source;
    	let source_src_value;
    	let t;

    	const block = {
    		c: function create() {
    			video = element("video");
    			source = element("source");
    			t = text("\n  Your browser does not support the video tag.");
    			if (!src_url_equal(source.src, source_src_value = "/video/Scene03.m4v")) attr_dev(source, "src", source_src_value);
    			attr_dev(source, "type", "video/mp4");
    			add_location(source, file$7, 7, 4, 112);
    			attr_dev(video, "class", "Scene03 svelte-pshpet");
    			video.autoplay = true;
    			add_location(video, file$7, 6, 0, 48);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, video, anchor);
    			append_dev(video, source);
    			append_dev(video, t);
    			/*video_binding*/ ctx[1](video);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(video);
    			/*video_binding*/ ctx[1](null);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Scene3', slots, []);
    	let { videoElement } = $$props;
    	const writable_props = ['videoElement'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Scene3> was created with unknown prop '${key}'`);
    	});

    	function video_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			videoElement = $$value;
    			$$invalidate(0, videoElement);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('videoElement' in $$props) $$invalidate(0, videoElement = $$props.videoElement);
    	};

    	$$self.$capture_state = () => ({ videoElement });

    	$$self.$inject_state = $$props => {
    		if ('videoElement' in $$props) $$invalidate(0, videoElement = $$props.videoElement);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [videoElement, video_binding];
    }

    class Scene3 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { videoElement: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Scene3",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*videoElement*/ ctx[0] === undefined && !('videoElement' in props)) {
    			console.warn("<Scene3> was created without expected prop 'videoElement'");
    		}
    	}

    	get videoElement() {
    		throw new Error("<Scene3>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set videoElement(value) {
    		throw new Error("<Scene3>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/scenes/scene4.svelte generated by Svelte v3.49.0 */

    const file$6 = "src/scenes/scene4.svelte";

    function create_fragment$6(ctx) {
    	let video;
    	let source;
    	let source_src_value;
    	let t;

    	const block = {
    		c: function create() {
    			video = element("video");
    			source = element("source");
    			t = text("\n  Your browser does not support the video tag.");
    			if (!src_url_equal(source.src, source_src_value = "/video/Scene04.m4v")) attr_dev(source, "src", source_src_value);
    			attr_dev(source, "type", "video/mp4");
    			add_location(source, file$6, 7, 4, 112);
    			attr_dev(video, "class", "Scene04 svelte-1v1e9lu");
    			video.autoplay = true;
    			add_location(video, file$6, 6, 0, 48);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, video, anchor);
    			append_dev(video, source);
    			append_dev(video, t);
    			/*video_binding*/ ctx[1](video);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(video);
    			/*video_binding*/ ctx[1](null);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Scene4', slots, []);
    	let { videoElement } = $$props;
    	const writable_props = ['videoElement'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Scene4> was created with unknown prop '${key}'`);
    	});

    	function video_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			videoElement = $$value;
    			$$invalidate(0, videoElement);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('videoElement' in $$props) $$invalidate(0, videoElement = $$props.videoElement);
    	};

    	$$self.$capture_state = () => ({ videoElement });

    	$$self.$inject_state = $$props => {
    		if ('videoElement' in $$props) $$invalidate(0, videoElement = $$props.videoElement);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [videoElement, video_binding];
    }

    class Scene4 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { videoElement: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Scene4",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*videoElement*/ ctx[0] === undefined && !('videoElement' in props)) {
    			console.warn("<Scene4> was created without expected prop 'videoElement'");
    		}
    	}

    	get videoElement() {
    		throw new Error("<Scene4>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set videoElement(value) {
    		throw new Error("<Scene4>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/scenes/scene5.svelte generated by Svelte v3.49.0 */

    const file$5 = "src/scenes/scene5.svelte";

    function create_fragment$5(ctx) {
    	let video;
    	let source;
    	let source_src_value;
    	let t;

    	const block = {
    		c: function create() {
    			video = element("video");
    			source = element("source");
    			t = text("\n  Your browser does not support the video tag.");
    			if (!src_url_equal(source.src, source_src_value = "/video/Scene05.m4v")) attr_dev(source, "src", source_src_value);
    			attr_dev(source, "type", "video/mp4");
    			add_location(source, file$5, 7, 4, 113);
    			attr_dev(video, "class", "Scene05 svelte-lnfo5z");
    			video.autoplay = true;
    			add_location(video, file$5, 6, 0, 48);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, video, anchor);
    			append_dev(video, source);
    			append_dev(video, t);
    			/*video_binding*/ ctx[1](video);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(video);
    			/*video_binding*/ ctx[1](null);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Scene5', slots, []);
    	let { videoElement } = $$props;
    	const writable_props = ['videoElement'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Scene5> was created with unknown prop '${key}'`);
    	});

    	function video_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			videoElement = $$value;
    			$$invalidate(0, videoElement);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('videoElement' in $$props) $$invalidate(0, videoElement = $$props.videoElement);
    	};

    	$$self.$capture_state = () => ({ videoElement });

    	$$self.$inject_state = $$props => {
    		if ('videoElement' in $$props) $$invalidate(0, videoElement = $$props.videoElement);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [videoElement, video_binding];
    }

    class Scene5 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { videoElement: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Scene5",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*videoElement*/ ctx[0] === undefined && !('videoElement' in props)) {
    			console.warn("<Scene5> was created without expected prop 'videoElement'");
    		}
    	}

    	get videoElement() {
    		throw new Error("<Scene5>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set videoElement(value) {
    		throw new Error("<Scene5>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/scenes/scene6.svelte generated by Svelte v3.49.0 */

    const file$4 = "src/scenes/scene6.svelte";

    function create_fragment$4(ctx) {
    	let video;
    	let source;
    	let source_src_value;
    	let t;

    	const block = {
    		c: function create() {
    			video = element("video");
    			source = element("source");
    			t = text("\n  Your browser does not support the video tag.");
    			if (!src_url_equal(source.src, source_src_value = "/video/Scene06.m4v")) attr_dev(source, "src", source_src_value);
    			attr_dev(source, "type", "video/mp4");
    			add_location(source, file$4, 7, 4, 112);
    			attr_dev(video, "class", "Scene06 svelte-pd6rbo");
    			video.autoplay = true;
    			add_location(video, file$4, 6, 0, 48);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, video, anchor);
    			append_dev(video, source);
    			append_dev(video, t);
    			/*video_binding*/ ctx[1](video);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(video);
    			/*video_binding*/ ctx[1](null);
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

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Scene6', slots, []);
    	let { videoElement } = $$props;
    	const writable_props = ['videoElement'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Scene6> was created with unknown prop '${key}'`);
    	});

    	function video_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			videoElement = $$value;
    			$$invalidate(0, videoElement);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('videoElement' in $$props) $$invalidate(0, videoElement = $$props.videoElement);
    	};

    	$$self.$capture_state = () => ({ videoElement });

    	$$self.$inject_state = $$props => {
    		if ('videoElement' in $$props) $$invalidate(0, videoElement = $$props.videoElement);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [videoElement, video_binding];
    }

    class Scene6 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { videoElement: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Scene6",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*videoElement*/ ctx[0] === undefined && !('videoElement' in props)) {
    			console.warn("<Scene6> was created without expected prop 'videoElement'");
    		}
    	}

    	get videoElement() {
    		throw new Error("<Scene6>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set videoElement(value) {
    		throw new Error("<Scene6>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
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
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    var screenfull$1 = {exports: {}};

    /*!
    * screenfull
    * v5.2.0 - 2021-11-03
    * (c) Sindre Sorhus; MIT License
    */

    (function (module) {
    	(function () {

    		var document = typeof window !== 'undefined' && typeof window.document !== 'undefined' ? window.document : {};
    		var isCommonjs = module.exports;

    		var fn = (function () {
    			var val;

    			var fnMap = [
    				[
    					'requestFullscreen',
    					'exitFullscreen',
    					'fullscreenElement',
    					'fullscreenEnabled',
    					'fullscreenchange',
    					'fullscreenerror'
    				],
    				// New WebKit
    				[
    					'webkitRequestFullscreen',
    					'webkitExitFullscreen',
    					'webkitFullscreenElement',
    					'webkitFullscreenEnabled',
    					'webkitfullscreenchange',
    					'webkitfullscreenerror'

    				],
    				// Old WebKit
    				[
    					'webkitRequestFullScreen',
    					'webkitCancelFullScreen',
    					'webkitCurrentFullScreenElement',
    					'webkitCancelFullScreen',
    					'webkitfullscreenchange',
    					'webkitfullscreenerror'

    				],
    				[
    					'mozRequestFullScreen',
    					'mozCancelFullScreen',
    					'mozFullScreenElement',
    					'mozFullScreenEnabled',
    					'mozfullscreenchange',
    					'mozfullscreenerror'
    				],
    				[
    					'msRequestFullscreen',
    					'msExitFullscreen',
    					'msFullscreenElement',
    					'msFullscreenEnabled',
    					'MSFullscreenChange',
    					'MSFullscreenError'
    				]
    			];

    			var i = 0;
    			var l = fnMap.length;
    			var ret = {};

    			for (; i < l; i++) {
    				val = fnMap[i];
    				if (val && val[1] in document) {
    					for (i = 0; i < val.length; i++) {
    						ret[fnMap[0][i]] = val[i];
    					}
    					return ret;
    				}
    			}

    			return false;
    		})();

    		var eventNameMap = {
    			change: fn.fullscreenchange,
    			error: fn.fullscreenerror
    		};

    		var screenfull = {
    			request: function (element, options) {
    				return new Promise(function (resolve, reject) {
    					var onFullScreenEntered = function () {
    						this.off('change', onFullScreenEntered);
    						resolve();
    					}.bind(this);

    					this.on('change', onFullScreenEntered);

    					element = element || document.documentElement;

    					var returnPromise = element[fn.requestFullscreen](options);

    					if (returnPromise instanceof Promise) {
    						returnPromise.then(onFullScreenEntered).catch(reject);
    					}
    				}.bind(this));
    			},
    			exit: function () {
    				return new Promise(function (resolve, reject) {
    					if (!this.isFullscreen) {
    						resolve();
    						return;
    					}

    					var onFullScreenExit = function () {
    						this.off('change', onFullScreenExit);
    						resolve();
    					}.bind(this);

    					this.on('change', onFullScreenExit);

    					var returnPromise = document[fn.exitFullscreen]();

    					if (returnPromise instanceof Promise) {
    						returnPromise.then(onFullScreenExit).catch(reject);
    					}
    				}.bind(this));
    			},
    			toggle: function (element, options) {
    				return this.isFullscreen ? this.exit() : this.request(element, options);
    			},
    			onchange: function (callback) {
    				this.on('change', callback);
    			},
    			onerror: function (callback) {
    				this.on('error', callback);
    			},
    			on: function (event, callback) {
    				var eventName = eventNameMap[event];
    				if (eventName) {
    					document.addEventListener(eventName, callback, false);
    				}
    			},
    			off: function (event, callback) {
    				var eventName = eventNameMap[event];
    				if (eventName) {
    					document.removeEventListener(eventName, callback, false);
    				}
    			},
    			raw: fn
    		};

    		if (!fn) {
    			if (isCommonjs) {
    				module.exports = {isEnabled: false};
    			} else {
    				window.screenfull = {isEnabled: false};
    			}

    			return;
    		}

    		Object.defineProperties(screenfull, {
    			isFullscreen: {
    				get: function () {
    					return Boolean(document[fn.fullscreenElement]);
    				}
    			},
    			element: {
    				enumerable: true,
    				get: function () {
    					return document[fn.fullscreenElement];
    				}
    			},
    			isEnabled: {
    				enumerable: true,
    				get: function () {
    					// Coerce to boolean in case of old WebKit
    					return Boolean(document[fn.fullscreenEnabled]);
    				}
    			}
    		});

    		if (isCommonjs) {
    			module.exports = screenfull;
    		} else {
    			window.screenfull = screenfull;
    		}
    	})();
    } (screenfull$1));

    var screenfull = screenfull$1.exports;

    /* node_modules/svelte-fullscreen/dist/Fullscreen.svelte generated by Svelte v3.49.0 */
    const file$3 = "node_modules/svelte-fullscreen/dist/Fullscreen.svelte";
    const get_default_slot_changes = dirty => ({});

    const get_default_slot_context = ctx => ({
    	onToggle: /*onToggle*/ ctx[1],
    	onRequest: /*onRequest*/ ctx[2],
    	onExit: /*onExit*/ ctx[3]
    });

    function create_fragment$3(ctx) {
    	let div;
    	let t;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], get_default_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = space();
    			if (default_slot) default_slot.c();
    			set_style(div, "width", "0");
    			set_style(div, "height", "0");
    			add_location(div, file$3, 34, 0, 946);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			/*div_binding*/ ctx[6](div);
    			insert_dev(target, t, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[4],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
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
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[6](null);
    			if (detaching) detach_dev(t);
    			if (default_slot) default_slot.d(detaching);
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
    	validate_slots('Fullscreen', slots, ['default']);
    	let component;
    	const dispatch = createEventDispatcher();

    	onMount(() => {
    		if (screenfull.isEnabled) {
    			screenfull.on("change", () => dispatch("change"));
    			screenfull.on("error", () => dispatch("error"));
    		}
    	});

    	const onToggle = () => {
    		if (screenfull.isEnabled && component?.nextElementSibling) {
    			screenfull.toggle(component.nextElementSibling);
    		}
    	};

    	const onRequest = () => {
    		if (screenfull.isEnabled && component?.nextElementSibling) {
    			screenfull.request(component.nextElementSibling);
    		}
    	};

    	const onExit = () => {
    		if (screenfull.isEnabled && component?.nextElementSibling) {
    			screenfull.exit();
    		}
    	};

    	onDestroy(() => {
    		if (screenfull.isEnabled) {
    			screenfull.off("change", () => true);
    			screenfull.off("error", () => true);
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Fullscreen> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			component = $$value;
    			$$invalidate(0, component);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		createEventDispatcher,
    		screenfull,
    		component,
    		dispatch,
    		onToggle,
    		onRequest,
    		onExit
    	});

    	$$self.$inject_state = $$props => {
    		if ('component' in $$props) $$invalidate(0, component = $$props.component);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [component, onToggle, onRequest, onExit, $$scope, slots, div_binding];
    }

    class Fullscreen extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Fullscreen",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* node_modules/svelte-icons/md/MdFullscreen.svelte generated by Svelte v3.49.0 */
    const file$2 = "node_modules/svelte-icons/md/MdFullscreen.svelte";

    // (4:8) <IconBase viewBox="0 0 24 24" {...$$props}>
    function create_default_slot$2(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z");
    			add_location(path, file$2, 4, 10, 151);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 24 24\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let iconbase;
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 24 24" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$2] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
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
    	validate_slots('MdFullscreen', slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class MdFullscreen extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MdFullscreen",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* node_modules/svelte-icons/md/MdFullscreenExit.svelte generated by Svelte v3.49.0 */
    const file$1 = "node_modules/svelte-icons/md/MdFullscreenExit.svelte";

    // (4:8) <IconBase viewBox="0 0 24 24" {...$$props}>
    function create_default_slot$1(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z");
    			add_location(path, file$1, 4, 10, 151);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(4:8) <IconBase viewBox=\\\"0 0 24 24\\\" {...$$props}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let iconbase;
    	let current;
    	const iconbase_spread_levels = [{ viewBox: "0 0 24 24" }, /*$$props*/ ctx[0]];

    	let iconbase_props = {
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < iconbase_spread_levels.length; i += 1) {
    		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
    	}

    	iconbase = new IconBase({ props: iconbase_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(iconbase.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbase, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const iconbase_changes = (dirty & /*$$props*/ 1)
    			? get_spread_update(iconbase_spread_levels, [iconbase_spread_levels[0], get_spread_object(/*$$props*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 2) {
    				iconbase_changes.$$scope = { dirty, ctx };
    			}

    			iconbase.$set(iconbase_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbase.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbase.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbase, detaching);
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

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MdFullscreenExit', slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ IconBase });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class MdFullscreenExit extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MdFullscreenExit",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.49.0 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    // (60:8) {#if showOnMove}
    function create_if_block_7(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let t0;
    	let a0;
    	let img0;
    	let img0_src_value;
    	let t1;
    	let a1;
    	let img1;
    	let img1_src_value;
    	let t2;
    	let menu;
    	let div_transition;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block_8, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*fstoggle*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	menu = new Menu({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			t0 = space();
    			a0 = element("a");
    			img0 = element("img");
    			t1 = space();
    			a1 = element("a");
    			img1 = element("img");
    			t2 = space();
    			create_component(menu.$$.fragment);
    			attr_dev(img0, "class", "icon svelte-sfg9kw");
    			if (!src_url_equal(img0.src, img0_src_value = "img/back.png")) attr_dev(img0, "src", img0_src_value);
    			add_location(img0, file, 66, 60, 2045);
    			attr_dev(a0, "class", "left-button svelte-sfg9kw");
    			add_location(a0, file, 66, 16, 2001);
    			attr_dev(img1, "class", "icon svelte-sfg9kw");
    			if (!src_url_equal(img1.src, img1_src_value = "img/next.png")) attr_dev(img1, "src", img1_src_value);
    			add_location(img1, file, 67, 64, 2151);
    			attr_dev(a1, "class", "right-button svelte-sfg9kw");
    			add_location(a1, file, 67, 16, 2103);
    			add_location(div, file, 60, 12, 1608);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			append_dev(div, t0);
    			append_dev(div, a0);
    			append_dev(a0, img0);
    			append_dev(div, t1);
    			append_dev(div, a1);
    			append_dev(a1, img1);
    			append_dev(div, t2);
    			mount_component(menu, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(a0, "click", /*sceneBack*/ ctx[5], false, false, false),
    					listen_dev(a1, "click", /*sceneForward*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
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
    				if_block.m(div, t0);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(menu.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(menu.$$.fragment, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    			destroy_component(menu);
    			if (detaching && div_transition) div_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(60:8) {#if showOnMove}",
    		ctx
    	});

    	return block;
    }

    // (64:16) {:else}
    function create_else_block(ctx) {
    	let div;
    	let mdfullscreenexit;
    	let current;
    	let mounted;
    	let dispose;
    	mdfullscreenexit = new MdFullscreenExit({ $$inline: true });

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[9](/*onExit*/ ctx[19]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(mdfullscreenexit.$$.fragment);
    			attr_dev(div, "class", "fullscreen-toggle svelte-sfg9kw");
    			add_location(div, file, 64, 16, 1859);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(mdfullscreenexit, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mdfullscreenexit.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mdfullscreenexit.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(mdfullscreenexit);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(64:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (62:16) {#if !fstoggle}
    function create_if_block_8(ctx) {
    	let div;
    	let mdfullscreen;
    	let current;
    	let mounted;
    	let dispose;
    	mdfullscreen = new MdFullscreen({ $$inline: true });

    	function click_handler() {
    		return /*click_handler*/ ctx[8](/*onRequest*/ ctx[18]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(mdfullscreen.$$.fragment);
    			attr_dev(div, "class", "fullscreen-toggle svelte-sfg9kw");
    			add_location(div, file, 62, 16, 1678);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(mdfullscreen, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mdfullscreen.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mdfullscreen.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(mdfullscreen);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(62:16) {#if !fstoggle}",
    		ctx
    	});

    	return block;
    }

    // (103:32) 
    function create_if_block_6(ctx) {
    	let div;
    	let scene6;
    	let updating_videoElement;
    	let div_transition;
    	let current;

    	function scene6_videoElement_binding(value) {
    		/*scene6_videoElement_binding*/ ctx[16](value);
    	}

    	let scene6_props = {};

    	if (/*sceneVideo*/ ctx[0] !== void 0) {
    		scene6_props.videoElement = /*sceneVideo*/ ctx[0];
    	}

    	scene6 = new Scene6({ props: scene6_props, $$inline: true });
    	binding_callbacks.push(() => bind(scene6, 'videoElement', scene6_videoElement_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(scene6.$$.fragment);
    			add_location(div, file, 103, 8, 3275);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(scene6, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const scene6_changes = {};

    			if (!updating_videoElement && dirty & /*sceneVideo*/ 1) {
    				updating_videoElement = true;
    				scene6_changes.videoElement = /*sceneVideo*/ ctx[0];
    				add_flush_callback(() => updating_videoElement = false);
    			}

    			scene6.$set(scene6_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(scene6.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(scene6.$$.fragment, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(scene6);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(103:32) ",
    		ctx
    	});

    	return block;
    }

    // (98:32) 
    function create_if_block_5(ctx) {
    	let div;
    	let scene5;
    	let updating_videoElement;
    	let div_transition;
    	let current;

    	function scene5_videoElement_binding(value) {
    		/*scene5_videoElement_binding*/ ctx[15](value);
    	}

    	let scene5_props = {};

    	if (/*sceneVideo*/ ctx[0] !== void 0) {
    		scene5_props.videoElement = /*sceneVideo*/ ctx[0];
    	}

    	scene5 = new Scene5({ props: scene5_props, $$inline: true });
    	binding_callbacks.push(() => bind(scene5, 'videoElement', scene5_videoElement_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(scene5.$$.fragment);
    			add_location(div, file, 98, 8, 3140);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(scene5, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const scene5_changes = {};

    			if (!updating_videoElement && dirty & /*sceneVideo*/ 1) {
    				updating_videoElement = true;
    				scene5_changes.videoElement = /*sceneVideo*/ ctx[0];
    				add_flush_callback(() => updating_videoElement = false);
    			}

    			scene5.$set(scene5_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(scene5.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(scene5.$$.fragment, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(scene5);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(98:32) ",
    		ctx
    	});

    	return block;
    }

    // (93:32) 
    function create_if_block_4(ctx) {
    	let div;
    	let scene4;
    	let updating_videoElement;
    	let div_intro;
    	let current;

    	function scene4_videoElement_binding(value) {
    		/*scene4_videoElement_binding*/ ctx[14](value);
    	}

    	let scene4_props = {};

    	if (/*sceneVideo*/ ctx[0] !== void 0) {
    		scene4_props.videoElement = /*sceneVideo*/ ctx[0];
    	}

    	scene4 = new Scene4({ props: scene4_props, $$inline: true });
    	binding_callbacks.push(() => bind(scene4, 'videoElement', scene4_videoElement_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(scene4.$$.fragment);
    			add_location(div, file, 93, 8, 2990);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(scene4, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const scene4_changes = {};

    			if (!updating_videoElement && dirty & /*sceneVideo*/ 1) {
    				updating_videoElement = true;
    				scene4_changes.videoElement = /*sceneVideo*/ ctx[0];
    				add_flush_callback(() => updating_videoElement = false);
    			}

    			scene4.$set(scene4_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(scene4.$$.fragment, local);

    			if (!div_intro) {
    				add_render_callback(() => {
    					div_intro = create_in_transition(div, fade, { duration: 3000 });
    					div_intro.start();
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(scene4.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(scene4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(93:32) ",
    		ctx
    	});

    	return block;
    }

    // (89:32) 
    function create_if_block_3(ctx) {
    	let div;
    	let scene3;
    	let updating_videoElement;
    	let div_intro;
    	let div_outro;
    	let current;

    	function scene3_videoElement_binding(value) {
    		/*scene3_videoElement_binding*/ ctx[13](value);
    	}

    	let scene3_props = {};

    	if (/*sceneVideo*/ ctx[0] !== void 0) {
    		scene3_props.videoElement = /*sceneVideo*/ ctx[0];
    	}

    	scene3 = new Scene3({ props: scene3_props, $$inline: true });
    	binding_callbacks.push(() => bind(scene3, 'videoElement', scene3_videoElement_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(scene3.$$.fragment);
    			add_location(div, file, 89, 8, 2799);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(scene3, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const scene3_changes = {};

    			if (!updating_videoElement && dirty & /*sceneVideo*/ 1) {
    				updating_videoElement = true;
    				scene3_changes.videoElement = /*sceneVideo*/ ctx[0];
    				add_flush_callback(() => updating_videoElement = false);
    			}

    			scene3.$set(scene3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(scene3.$$.fragment, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				div_intro = create_in_transition(div, fly, { x: -200, duration: 2000 });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(scene3.$$.fragment, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fade, { duration: 3000 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(scene3);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(89:32) ",
    		ctx
    	});

    	return block;
    }

    // (85:32) 
    function create_if_block_2(ctx) {
    	let div;
    	let scene2;
    	let updating_videoElement;
    	let div_outro;
    	let current;

    	function scene2_videoElement_binding(value) {
    		/*scene2_videoElement_binding*/ ctx[12](value);
    	}

    	let scene2_props = {};

    	if (/*sceneVideo*/ ctx[0] !== void 0) {
    		scene2_props.videoElement = /*sceneVideo*/ ctx[0];
    	}

    	scene2 = new Scene2({ props: scene2_props, $$inline: true });
    	binding_callbacks.push(() => bind(scene2, 'videoElement', scene2_videoElement_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(scene2.$$.fragment);
    			add_location(div, file, 85, 8, 2640);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(scene2, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const scene2_changes = {};

    			if (!updating_videoElement && dirty & /*sceneVideo*/ 1) {
    				updating_videoElement = true;
    				scene2_changes.videoElement = /*sceneVideo*/ ctx[0];
    				add_flush_callback(() => updating_videoElement = false);
    			}

    			scene2.$set(scene2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(scene2.$$.fragment, local);
    			if (div_outro) div_outro.end(1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(scene2.$$.fragment, local);
    			div_outro = create_out_transition(div, fly, { x: 200, duration: 2000 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(scene2);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(85:32) ",
    		ctx
    	});

    	return block;
    }

    // (80:36) 
    function create_if_block_1(ctx) {
    	let div;
    	let p;
    	let div_outro;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "test poster";
    			add_location(p, file, 82, 12, 2565);
    			add_location(div, file, 80, 8, 2472);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			if (div_outro) div_outro.end(1);
    			current = true;
    		},
    		o: function outro(local) {
    			div_outro = create_out_transition(div, fly, { x: 200, duration: 2000 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(80:36) ",
    		ctx
    	});

    	return block;
    }

    // (76:0) {#if currentScene == 0}
    function create_if_block(ctx) {
    	let div;
    	let scene1;
    	let updating_videoElement;
    	let updating_currentScene;
    	let current;

    	function scene1_videoElement_binding(value) {
    		/*scene1_videoElement_binding*/ ctx[10](value);
    	}

    	function scene1_currentScene_binding(value) {
    		/*scene1_currentScene_binding*/ ctx[11](value);
    	}

    	let scene1_props = {};

    	if (/*sceneVideo*/ ctx[0] !== void 0) {
    		scene1_props.videoElement = /*sceneVideo*/ ctx[0];
    	}

    	if (/*currentScene*/ ctx[3] !== void 0) {
    		scene1_props.currentScene = /*currentScene*/ ctx[3];
    	}

    	scene1 = new Scene1({ props: scene1_props, $$inline: true });
    	binding_callbacks.push(() => bind(scene1, 'videoElement', scene1_videoElement_binding));
    	binding_callbacks.push(() => bind(scene1, 'currentScene', scene1_currentScene_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(scene1.$$.fragment);
    			add_location(div, file, 76, 8, 2314);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(scene1, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const scene1_changes = {};

    			if (!updating_videoElement && dirty & /*sceneVideo*/ 1) {
    				updating_videoElement = true;
    				scene1_changes.videoElement = /*sceneVideo*/ ctx[0];
    				add_flush_callback(() => updating_videoElement = false);
    			}

    			if (!updating_currentScene && dirty & /*currentScene*/ 8) {
    				updating_currentScene = true;
    				scene1_changes.currentScene = /*currentScene*/ ctx[3];
    				add_flush_callback(() => updating_currentScene = false);
    			}

    			scene1.$set(scene1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(scene1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(scene1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(scene1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(76:0) {#if currentScene == 0}",
    		ctx
    	});

    	return block;
    }

    // (58:0) <Fullscreen let:onRequest let:onExit>
    function create_default_slot(ctx) {
    	let div1;
    	let t;
    	let div0;
    	let current_block_type_index;
    	let if_block1;
    	let current;
    	let if_block0 = /*showOnMove*/ ctx[2] && create_if_block_7(ctx);

    	const if_block_creators = [
    		create_if_block,
    		create_if_block_1,
    		create_if_block_2,
    		create_if_block_3,
    		create_if_block_4,
    		create_if_block_5,
    		create_if_block_6
    	];

    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*currentScene*/ ctx[3] == 0) return 0;
    		if (/*currentScene*/ ctx[3] == 1) return 1;
    		if (/*currentScene*/ ctx[3] == 2) return 2;
    		if (/*currentScene*/ ctx[3] == 3) return 3;
    		if (/*currentScene*/ ctx[3] == 4) return 4;
    		if (/*currentScene*/ ctx[3] == 5) return 5;
    		if (/*currentScene*/ ctx[3] == 6) return 6;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_1(ctx))) {
    		if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t = space();
    			div0 = element("div");
    			if (if_block1) if_block1.c();
    			attr_dev(div0, "class", "video-border svelte-sfg9kw");
    			add_location(div0, file, 74, 1, 2255);
    			add_location(div1, file, 58, 4, 1565);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t);
    			append_dev(div1, div0);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*showOnMove*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*showOnMove*/ 4) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_7(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div1, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block1) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block1 = if_blocks[current_block_type_index];

    					if (!if_block1) {
    						if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block1.c();
    					} else {
    						if_block1.p(ctx, dirty);
    					}

    					transition_in(if_block1, 1);
    					if_block1.m(div0, null);
    				} else {
    					if_block1 = null;
    				}
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
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(58:0) <Fullscreen let:onRequest let:onExit>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let fullscreen;
    	let current;
    	let mounted;
    	let dispose;

    	fullscreen = new Fullscreen({
    			props: {
    				$$slots: {
    					default: [
    						create_default_slot,
    						({ onRequest, onExit }) => ({ 18: onRequest, 19: onExit }),
    						({ onRequest, onExit }) => (onRequest ? 262144 : 0) | (onExit ? 524288 : 0)
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(fullscreen.$$.fragment);
    			attr_dev(main, "class", "svelte-sfg9kw");
    			toggle_class(main, "cursor_black_stamp", /*currentCursor*/ ctx[4] === "black");
    			toggle_class(main, "cursor_white_stamp", /*currentCursor*/ ctx[4] === "white");
    			add_location(main, file, 56, 0, 1355);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(fullscreen, main, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(main, "mousemove", /*onMouseMove*/ ctx[7], false, false, false),
    					listen_dev(main, "click", /*onMouseMove*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const fullscreen_changes = {};

    			if (dirty & /*$$scope, sceneVideo, currentScene, onRequest, fstoggle, onExit, showOnMove*/ 1835023) {
    				fullscreen_changes.$$scope = { dirty, ctx };
    			}

    			fullscreen.$set(fullscreen_changes);

    			if (dirty & /*currentCursor*/ 16) {
    				toggle_class(main, "cursor_black_stamp", /*currentCursor*/ ctx[4] === "black");
    			}

    			if (dirty & /*currentCursor*/ 16) {
    				toggle_class(main, "cursor_white_stamp", /*currentCursor*/ ctx[4] === "white");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fullscreen.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fullscreen.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(fullscreen);
    			mounted = false;
    			run_all(dispose);
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
    	validate_slots('App', slots, []);
    	let sceneVideo;
    	let fstoggle = false;
    	let showOnMove = false;
    	let timer;
    	let currentScene = 0;
    	let currentCursor = "";

    	const sceneBack = () => {
    		if (currentScene > 0) $$invalidate(3, currentScene--, currentScene);
    		console.log(currentScene);
    	};

    	const sceneForward = () => {
    		if (currentScene < 5) $$invalidate(3, currentScene++, currentScene); else $$invalidate(3, currentScene = 0);
    		console.log(currentScene);
    	};

    	const onMouseMove = () => {
    		$$invalidate(2, showOnMove = true);
    		clearTimeout(timer);

    		timer = setTimeout(
    			() => {
    				$$invalidate(2, showOnMove = false);
    			},
    			2000
    		);
    	};

    	setInterval(
    		() => {
    			console.log("video ended", sceneVideo);
    			console.log("currentScene", currentScene);

    			if (sceneVideo.ended) {
    				$$invalidate(2, showOnMove = true);
    			}

    			if (currentScene == 2 && sceneVideo.currentTime > 4) $$invalidate(4, currentCursor = "black"); else $$invalidate(4, currentCursor = "");
    		},
    		500
    	);

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = onRequest => {
    		onRequest();
    		$$invalidate(1, fstoggle = true);
    		screen.orientation.lock("landscape");
    	};

    	const click_handler_1 = onExit => {
    		onExit();
    		$$invalidate(1, fstoggle = false);
    	};

    	function scene1_videoElement_binding(value) {
    		sceneVideo = value;
    		$$invalidate(0, sceneVideo);
    	}

    	function scene1_currentScene_binding(value) {
    		currentScene = value;
    		$$invalidate(3, currentScene);
    	}

    	function scene2_videoElement_binding(value) {
    		sceneVideo = value;
    		$$invalidate(0, sceneVideo);
    	}

    	function scene3_videoElement_binding(value) {
    		sceneVideo = value;
    		$$invalidate(0, sceneVideo);
    	}

    	function scene4_videoElement_binding(value) {
    		sceneVideo = value;
    		$$invalidate(0, sceneVideo);
    	}

    	function scene5_videoElement_binding(value) {
    		sceneVideo = value;
    		$$invalidate(0, sceneVideo);
    	}

    	function scene6_videoElement_binding(value) {
    		sceneVideo = value;
    		$$invalidate(0, sceneVideo);
    	}

    	$$self.$capture_state = () => ({
    		Menu,
    		Scene1,
    		Scene2,
    		Scene3,
    		Scene4,
    		Scene5,
    		Scene6,
    		fade,
    		fly,
    		Fullscreen,
    		MdFullscreen,
    		MdFullscreenExit,
    		sceneVideo,
    		fstoggle,
    		showOnMove,
    		timer,
    		currentScene,
    		currentCursor,
    		sceneBack,
    		sceneForward,
    		onMouseMove
    	});

    	$$self.$inject_state = $$props => {
    		if ('sceneVideo' in $$props) $$invalidate(0, sceneVideo = $$props.sceneVideo);
    		if ('fstoggle' in $$props) $$invalidate(1, fstoggle = $$props.fstoggle);
    		if ('showOnMove' in $$props) $$invalidate(2, showOnMove = $$props.showOnMove);
    		if ('timer' in $$props) timer = $$props.timer;
    		if ('currentScene' in $$props) $$invalidate(3, currentScene = $$props.currentScene);
    		if ('currentCursor' in $$props) $$invalidate(4, currentCursor = $$props.currentCursor);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		sceneVideo,
    		fstoggle,
    		showOnMove,
    		currentScene,
    		currentCursor,
    		sceneBack,
    		sceneForward,
    		onMouseMove,
    		click_handler,
    		click_handler_1,
    		scene1_videoElement_binding,
    		scene1_currentScene_binding,
    		scene2_videoElement_binding,
    		scene3_videoElement_binding,
    		scene4_videoElement_binding,
    		scene5_videoElement_binding,
    		scene6_videoElement_binding
    	];
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
      target: document.getElementById('app')
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
