seajs.config({
    base:'/static/js/',
    alias:{
        jquery:'vendor/jquery.min.js?v=2.1.4',
        jqueryui:'vendor/jquery-ui-1.12.0.min.js',
        bootstrap:'vendor/bootstrap.min',
        form:'vendor/jquery.form.min',
        scroll:'vendor/jquery.slimscroll.min',
        layer:'vendor/layer/layer.min',
        clipboard:'vendor/clipboard.min.js',
        switch:'vendor/bootstrap-switch.min.js'
    },
    preload:['jquery']
});
seajs.use(['vendor/pace.min']);