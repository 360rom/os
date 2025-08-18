document.addEventListener('DOMContentLoaded', function() {
    // 展开/折叠初始化
    const defaultExpanded = true;
    setAllSectionsState(defaultExpanded);
    document.getElementById('global-toggle').checked = defaultExpanded;

    // 展开/折叠开关
    document.getElementById('global-toggle').addEventListener('change', function() {
        setAllSectionsState(this.checked);
    });

    // 单个section折叠/展开
    document.querySelectorAll('.section-header').forEach(header => {
        header.addEventListener('click', () => {
            header.parentElement.classList.toggle('active');
        });
    });

    // 搜索功能
    const searchInput = document.getElementById('search-input');
    document.getElementById('search-btn').addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', e => { if (e.key === 'Enter') performSearch(); });
    searchInput.addEventListener('input', performSearch);

    // 右下角按钮功能
    document.getElementById('topBtn').addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    document.getElementById('bottomBtn').addEventListener('click', () => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });

    // 微信二维码弹窗逻辑
    const wechatBtn = document.getElementById('wechatBtn');
    const wechatModal = document.getElementById('wechatModal');
    function showWechatModal() { wechatModal.style.display = 'block'; }
    function hideWechatModal() { wechatModal.style.display = 'none'; }
    wechatBtn.addEventListener('mouseenter', showWechatModal);
    wechatBtn.addEventListener('click', showWechatModal);
    wechatBtn.addEventListener('mouseleave', function() {
        setTimeout(function() {
            if (!wechatModal.matches(':hover') && !wechatBtn.matches(':hover')) {
                hideWechatModal();
            }
        }, 80);
    });
    wechatModal.addEventListener('mouseleave', hideWechatModal);
    wechatModal.addEventListener('mouseenter', showWechatModal);

    // 页脚说明弹窗
    var descBtn = document.getElementById('footerDescBtn');
    var footerModal = document.getElementById('footerModal');
    var footerModalClose = document.getElementById('footerModalClose');
    if (descBtn && footerModal && footerModalClose) {
        descBtn.onclick = function() { footerModal.style.display = 'block'; };
        footerModalClose.onclick = function() { footerModal.style.display = 'none'; };
        footerModal.onclick = function(e) {
            if (e.target === footerModal) footerModal.style.display = 'none';
        };
    }

    // 自动设置机型标题颜色
    document.querySelectorAll('.section-header[data-color]').forEach(header => {
        const color = header.getAttribute('data-color');
        if (color) header.querySelector('h2').style.color = color;
    });

    // 展开/折叠全部
    function setAllSectionsState(expand) {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.toggle('active', expand);
        });
    }

    // 搜索与高亮
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        document.querySelectorAll('.section').forEach(section => {
            const deviceName = section.dataset.device?.toLowerCase() || '';
            const itemTitles = section.querySelectorAll('.item-title');
            const itemDescs = section.querySelectorAll('.item-desc');
            let hasMatch = deviceName.includes(searchTerm);

            itemTitles.forEach(title => {
                const txt = title.textContent;
                title.innerHTML = txt.toLowerCase().includes(searchTerm) && searchTerm
                    ? highlightText(txt, searchTerm)
                    : txt;
                if (txt.toLowerCase().includes(searchTerm)) hasMatch = true;
            });
            itemDescs.forEach(desc => {
                const txt = desc.textContent;
                desc.innerHTML = txt.toLowerCase().includes(searchTerm) && searchTerm
                    ? highlightText(txt, searchTerm)
                    : txt;
                if (txt.toLowerCase().includes(searchTerm)) hasMatch = true;
            });

            section.style.display = hasMatch || !searchTerm ? 'block' : 'none';
            if (hasMatch || !searchTerm) section.classList.add('active');
        });
    }

    function highlightText(text, keyword) {
        if (!keyword) return text;
        return text.replace(new RegExp(`(${keyword})`, 'gi'), '<span style="background:yellow;color:#d32f2f;">$1</span>');
    }

    // 密码弹窗总开关 true false
    const pwdModalEnabled = true; 

    // 密码弹窗逻辑
    if (pwdModalEnabled) showPwdModal();

    function showPwdModal() {
        const pwdModal = document.getElementById('pwdModal');
        const pwdInput = document.getElementById('pwdInput');
        const pwdEyeBtn = document.getElementById('pwdEyeBtn');
        const pwdEyeIcon = document.getElementById('pwdEyeIcon');
        const pwdConfirmBtn = document.getElementById('pwdConfirmBtn');
        const pwdError = document.getElementById('pwdError');
        if (!pwdModal || !pwdInput || !pwdEyeBtn || !pwdEyeIcon || !pwdConfirmBtn || !pwdError) return;
        pwdModal.style.display = 'block';
        pwdInput.value = '';
        pwdError.textContent = '';
        pwdInput.type = 'password';
        pwdInput.focus();

        // 眼睛图标切换
        pwdEyeBtn.onclick = function() {
            if (pwdInput.type === 'password') {
                pwdInput.type = 'text';
                pwdEyeIcon.className = 'fa fa-eye';
            } else {
                pwdInput.type = 'password';
                pwdEyeIcon.className = 'fa fa-eye-slash';
            }
            pwdInput.focus();
        };

        // 密码校验
        function checkPwd() {
            const today = new Date();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            const pwd = mm + dd; // 例如 0817
            if (pwdInput.value === pwd) {
                pwdModal.style.display = 'none';
                pwdError.textContent = '';
            } else {
                pwdError.textContent = '密码错误';
                setTimeout(() => { pwdError.textContent = ''; }, 1000);
            }
        }
        pwdConfirmBtn.onclick = checkPwd;
        pwdInput.onkeypress = function(e) {
            if (e.key === 'Enter') checkPwd();
        };
    }

    // 禁止常用电脑按键功能配置
    const keyBlockConfig = {
        print: true,      // Ctrl+P
        copy: true,       // Ctrl+C
        save: true,       // Ctrl+S
        devtools: true,   // F12、Ctrl+Shift+I、Ctrl+Shift+J
        viewSource: true, // Ctrl+U
        iframe: true      // 禁止iframe右键
    };

    // 按键事件统一处理
    document.addEventListener('keydown', function (e) {
        // 打印
        if (keyBlockConfig.print && (e.ctrlKey && e.key.toLowerCase() === 'p')) {
            e.preventDefault();
            return false;
        }
        // 复制
        if (keyBlockConfig.copy && (e.ctrlKey && e.key.toLowerCase() === 'c')) {
            e.preventDefault();
            return false;
        }
        // 保存
        if (keyBlockConfig.save && (e.ctrlKey && e.key.toLowerCase() === 's')) {
            e.preventDefault();
            return false;
        }
        // F12/开发者工具
        if (keyBlockConfig.devtools && (
            e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && ['i', 'j'].includes(e.key.toLowerCase()))
        )) {
            e.preventDefault();
            return false;
        }
        // 查看源代码
        if (keyBlockConfig.viewSource && (e.ctrlKey && e.key.toLowerCase() === 'u')) {
            e.preventDefault();
            return false;
        }
    });

    // 禁止右键复制/保存
    if (keyBlockConfig.copy || keyBlockConfig.save) {
        document.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            return false;
        });
    }

    // 禁止iframe右键
    if (keyBlockConfig.iframe) {
        document.querySelectorAll('iframe').forEach(function (iframe) {
            iframe.contentWindow?.document?.addEventListener('contextmenu', function (e) {
                e.preventDefault();
                return false;
            });
        });
    }
});