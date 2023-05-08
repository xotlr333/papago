// source ~ : 번역할 텍스트, 번역할 언어의 타입(ko, ja...)
// target ~ : 번역 결과 텍스트, 번역될 언어의 타입(ko, ja...)

const [sourceSelect, targetSelect] = document.getElementsByClassName('form-select');
const [sourceTextArea, targetTextArea] = document.getElementsByClassName('textarea');

let sourceLanguage = sourceSelect.value;
let targetLanguage = targetSelect.value;

//  번역될 언어의 타입 변경 이벤트
targetSelect.addEventListener('change', (event) => {
    targetLanguage = event.target.value;
});


// 디바운싱 & 쓰로틀링
let debouncer; // timerID 값을 저장하는 변수
sourceTextArea.addEventListener('input', (event) => {
    if (debouncer) clearTimeout(debouncer);

    debouncer = setTimeout(() => {
        const text = event.target.value;

        /**
         * 서버에 HTTP 요청 전송을 위한 준비 코드
         * 1. 요청 URL
         * 2. 전동 데이터: HTTP Body(몸체)에 작성
         * 3. 몇 가지 메타정보: HTTP Header에 작성
         */
        
        // 첫 번째 요청: 언어 감지 기능 -> server.js(Node서버)로 전송
        detectLanguage(text);

    }, 2000);
});

const detectLanguage = (text) => {

    const detectUrl = '/detect';
        // const detectOptions = {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({ query: text }),
        // };

        const detectOptions = optionsFrom('POST', { query: text });

        fetch(detectUrl, detectOptions)
        .then(response => response.json())
        .then(data => {
            sourceLanguage = data.langCode;
            sourceSelect.value = sourceLanguage;

            // 두 번째 요청: 번역
            translateLanguage(text);
        })
        .catch(error => console.error(error));

};

const translateLanguage = (text) => {

    const translateUrl = '/translate';
    // const translateOptions = {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({ 
    //         source: sourceLanguage,
    //         target: targetLanguage,
    //         text: text
    //     }),
    // };
    const translateOptions = optionsFrom(
        'POST',
        {
            source: sourceLanguage,
            target: targetLanguage,
            text: text
        }
    );

    fetch(translateUrl, translateOptions)
    .then(response => response.json())
    .then(data => {
        targetTextArea.textContent = data.message.result.translatedText;
    });

};

const optionsFrom = (method, body, headers) => {
    return {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        body: JSON.stringify(body),
    }
};
