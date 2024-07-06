/** ["LogbookID", "trainDate", "trainTime"] */
const ZERO = ["LogbookID", "trainDate", "trainTime"];
/** ["Distance", "Time", "Rest", "Split", "Interval"] */
const FIRST = ["Distance", "Time", "Rest", "Split", "Interval"];
/** ["Result", "Average", "Rate"] */
const SECOND = ["Result", "Average", "Rate"];
/** ["third"] */
const THIRD = ["third"];
var jsonFile ={
    id : "",
    type : "",
    menu : "",
    time : "",
    average : "",
    rate : "",
    split : "",
};

addEventListener("DOMContentLoaded", ()=>{
    changeDisplay(ZERO, "revert")
    changeDisplay(["MT", "resultData", "first", "second", "third"].concat(FIRST, SECOND, THIRD, /*"check"*/), "none");
    // rePost()
    for (let elem of this.document.getElementsByClassName("output")){
        changeSpan(elem.getElementsByTagName("span")[0], 0);
    };
    for (let doc of this.document.getElementsByTagName("input")){doc.style.backgroundColor="lightpink"}
});
addEventListener("DOMContentLoaded", tabPos);
addEventListener("resize", tabPos);

/**********************************************
 *                    関数                    *
 **********************************************/
/** idリストを取得してdisplayをonまたはoffにする関数
 * @param {string[]} idList idの文字列リスト
 * @param {boolean} mark revert, none, block, etc...
 */
function changeDisplay(idList, mark){
    for (let id of idList){
        let doc = document.getElementById(id);
        doc.style.display = mark;
    };
};
/** class名からdisplayを変更 
 * @param {string[]} classNameList
 * @param {string} mark `none` or `revert`
 * @param {Document} doc inner doc
*/
function changeDisplayByClassNames(classNameList, mark, doc=document){
    for (let className of classNameList){
        /** @type {HTMLCollectionOf<HTMLElement>} */
        let docs = doc.getElementsByClassName(className);
        for (let elem of docs){
            elem.style.display = mark
        };
    };
};
/** idリストを取得して配下のinputタグの入力可否を設定 
 * @param {string[]} idList idの文字列リスト 
 * @param {boolean} mark true>disable false>able */
function changeDisabled(idList, mark){
    for (let id of idList){
        let inps = document.getElementById(id).getElementsByTagName("input");
        for (let elem of inps){
            elem.disabled = mark;
        };
    };
};
/** inputに入力された値が不適切ならカラーチェンジ
 * @param {string} id idの文字列リスト
 * @returns {number} inputエラーの数*/
function inputJudge(id){
    /** inputの色を変更するか否か 
     * @param {boolean} flag 判定する式(false>change)
     * @param {HTMLInputElement} doc inputElement
     * @returns {number}
    */
    function changeBGC(flag, doc){
        if (flag){
            doc.style.backgroundColor = "revert";
        } else {
            doc.style.backgroundColor = "lightpink";
        };
    };
    let doc = document.getElementById(id);
    if (doc.style.display == "none"){
        // console.log(id, "skipped");
        return
    };
    let inps = doc.getElementsByTagName("input");
    for (let inp of inps){
        let val = inp.value;
        // 判定，カラーチェンジ
        if (val == null | val == ""){
            changeBGC(false, inp);
        } else if (ZERO.includes(id)){
            changeBGC(true, inp);
        } else if (parseInt(val) == 0){
            changeBGC(false, inp);
        } else if (["Distance"].includes(id)){
            changeBGC(val.length >= 3, inp);
        } else if (["Time"].includes(id)){
            changeBGC(val.length >= 4, inp)
        } else if (["Rest"].includes(id)){
            changeBGC(val.length == 3, inp);
        } else if (["Split", "Interval", ].includes(id)){
            changeBGC(val.length >= 1, inp)
        } else if (["Result", "Average"].includes(id)){
            changeBGC(val.length == 4, inp);
        } else if (["Rate"].includes(id)){
            changeBGC(val.length == 2, inp);
        } else if (id.includes("splitValue")){
            changeBGC(val.length == 6, inp);
        };
    };
};
/** inputで取得した文字列を変換
 * @param {String} val inputで取得した文字列
 * @param {String} elementID idまたはclassの名称
 * @returns {String} spanに登録する文字列
 */
function format(val, elementID){
    if (elementID == "Distance"){
        return pad0(val, 5);
    } else if (["Rate"].includes(elementID)){
        return pad0(val, 2);
    } else if(["Interval", "Split"].includes(elementID)){
        return val;
    } else if (["Time", "Rest"].includes(elementID)){
        let hour, minute, second, res;
        // 0埋めで五桁0:00:00にして各値を取得
        val = (elementID=="Time") ? pad0(pad0(val, 4), 5, "left") : "00"+pad0(val, 3);
        minute = val.slice(0,3);
        second = val.slice(3,5);
        [minute, second] = calTime(minute, second);
        [hour, minute] = calTime(0, minute)
        res = hour+pad0(minute, 2, "left")+pad0(second, 2, "left");
        res = (elementID=="Time") ? res : res.slice(2,5);
        return res;
    } else if(["Average", "Result"].includes(elementID)){
        let minute, second, microsecond;
        // 0埋めで4桁0000にして各値を取得
        val = pad0(val, 4);
        minute = val.slice(0,1);
        second = val.slice(1,3);
        microsecond = val.slice(3,4);
        [minute, second] = calTime(minute, second);
        return minute+pad0(second, 2, "left")+microsecond;
    } else if(elementID.includes("splitValue")){
        let minute, second, microsecond, rate;
        val = pad0(val, 6)
        minute = val.slice(0,1);
        second = val.slice(1,3);
        [minute, second] = calTime(minute, second);
        microsecond = val.slice(3,4);
        rate = val.slice(4,6);
        return minute+pad0(second, 2, "left")+microsecond+rate;
    };
};
/** 0埋め
 * @param {string | number} val 文字列または数値
 * @param {number} digit maxlength
 * @param {string} side left or right
 * @returns {string} 文字列
 */
function pad0(val, digit, side="right"){
    val = val.toString();
    let num = digit - val.length;
    if (num>=0){
        if (side == "left"){
            return "0".repeat(num) + val;
        } else {
            return val + "0".repeat(num);
        };
    } else {
        return val;
    };
};
/** 時間の計算，lowが60以上なら上に繰り上げして返す
 * @param {string | number} high 高位
 * @param {string | number} low 低位
 * @returns {string[]}
 */
function calTime(high, low){
    high = parseInt(high);
    low = parseInt(low);
    while (low >= 60) {
        high += 1;
        low -= 60;
    };
    return [high.toString(), low.toString()];
};
/** splitまたはintervalの表示されている数値を取得
 * @returns {number}
 */
function numSplInt() {
    let num = 0;
    for (let tag of ["Split", "Interval"]) {
        let spl = document.getElementById(tag);
        if (spl.style.display == "revert") {
            num = parseInt(spl.getElementsByTagName("input")[0].value);
        };
    };
    return num;
};
/** resultDataの位置調整 */
function tabPos(){
    let res = document.getElementById("resultData");
    if (window.innerWidth >= 1200){
        let baseH = document.getElementById("base").offsetHeight;
        res.style.marginTop = "-"+baseH+"px";
    } else {
        res.style.marginTop = "0px";
    };
};
/** inputに入力された値を整形 */
function convert(id){
    let inp = document.getElementById(id).getElementsByTagName("input")[0];
    let val = inp.value;
    val = (["trainDate", "trainTime"].includes(id)) ? val : val.replace(/[^0-9]+/i, "");
    inp.value = val;
    inputJudge(id);
    if (ZERO.includes(id)){return};
    let len = val.length;
    if (len == 0){val = "0"};
    val = format(val, id);
    let outs = document.getElementById(id).getElementsByClassName("output")[0].getElementsByTagName("span");
    if (id == "Time"){
        let m10 = (val.slice(0,1)=="0") ? val.slice(1,2) : val.slice(0,1)+":"+val.slice(1,2);
        for (let i=0; i<outs.length; i++){
            outs[i].textContent = (i==0) ? m10 : val.slice(i+1, i+2);
            changeSpan(outs[i], i-len);
        };
    } else if (["Interval", "Split"].includes(id)){
        outs[0].textContent = val;
        changeSpan(outs[0], parseInt(val));
        outs[0].style.fontWeight = (parseInt(val)>0) ? "600":"500";
    } else {
        for (let i=0; i<val.length; i++){
            outs[i].textContent = val.slice(i,i+1);
            changeSpan(outs[i], i-len);
            if (outs[i].classList.contains("behind")){
                outs[i].style.display = (len>=i+1) ? "revert" : "none";
            };
        };
    };
};
/**
 * 
 * @param {HTMLSpanElement} elem 
 * @param {number} flag negative:done, 0:now, positive:uninput
 */
function changeSpan(elem, flag){
    // background
    elem.style.backgroundColor = (flag==0)?"black":"revert";
    // fontcolor
    elem.style.color = (flag==0)?"white":"black";
    // bold
    elem.style.fontWeight = (flag<0)?"600":"500"
}
/** third のsplitValuesを削除する関数 
 * @param {number} num  既存のsplitValueの数
*/
function removeSpVal(num){
    for (let i = 1; i <= num; i++){
        document.getElementById("splitValue"+i).remove();
    };
};
/** ResultまたはAverageを表示する
 * @returns {boolean} 2000TT>true, the others>false
 */
function ResAve(){
    /** @type {HTMLInputElement} */
    let SD = document.getElementsByName("Type")[0];
    let num = parseInt(document.getElementById("Distance").getElementsByTagName("input")[0].value);
    if (SD.checked && num == 2000){
        return true;
    } else {
        return false;
    };
};
/**
 * 
 * @param {string[]} idList idList
 */
function colorCheck(idList){
    let cnt = 0;
    for (let id of idList){
        let doc = document.getElementById(id);
        let inp = doc.getElementsByTagName("input")[0];
        console.log(`ID\t\t${id}\nName\t\t${inp.name}\nDisplay\t\t${doc.style.display}\nColor\t\t${inp.style.backgroundColor}\nDisabled\t${inp.disabled}`)
        cnt += (doc.style.display == "revert" && inp.style.backgroundColor=="lightpink") ? 1 : 0;
    };
    return 0
    return cnt
};
/**************************************************************
 *                 以降はボタン操作等の処理                     *
***************************************************************/
/** splitVlaueの並べ替えのクラス*/
class sortSplit {
    /** 
     * @param {number} i identifier
     * @param {number} num all 
    */
    constructor(num){
        // /** number of splitValue (clicked) */
        // this.index = i;
        /** amount of splitValue */
        this.num = num;
        /** @type {} X range of valid area */
        this.coordRangeX = {};
        /** Y range of valid area of each splitValue */
        this.coordRangeYs = {};
        /** @type {HTMLTableRowElement} splitValue table row element */
        this.spl_tr;
        /** @type {HTMLImageElement} splitValue img element */
        this.spl_img;
        /** @type {HTMLTableRowElement} separator table row element */
        this.sep_tr;
        /** @type {number} horizonal position (longtitude) of mouse */
        this.x;
        /** @type {number} vartical position (latitude) of mouse */
        this.y;
        /** @type {number[]} separator index which is exist at both side of dragged row */
        this.sep_trsprnt;
        /** @type {number} opaque separator index */
        this.index;
        /** @type {string[]} List of inputed value for sorting */
        this.sortList;

        this.init();
    };

    init(){
        this.source();
        this.target();
    };
    /*--------------------------------------------- 
    source = splitValue
    ----------------------------------------------*/
    /** イベントの追加 */
    source(){
        // デバイスタイプ touch/mouse
        let supportouch = "ontouchstart" in document;
        let EVENTNAME_TS = supportouch ? "touchstart" : "mousedown";
        let EVENTNAME_TE = supportouch ? "touchend" : "mouseup";
        // イベントの追加
        for (let i=1; i<=this.num; i++){
            // 引数のパラメータ取得
            let id = `splitValue${i}`
            let elem_tr = document.getElementById(id);
            let elem_img = elem_tr.getElementsByTagName("img")[0];
            elem_img.addEventListener(EVENTNAME_TS, (eve)=>{this.start(eve)}, false);
            elem_tr.addEventListener("drag", (eve)=>{this.drag(eve)}, false);
            elem_tr.addEventListener("dragend", (eve)=>{this.end(eve)}, false);
            elem_img.addEventListener(EVENTNAME_TE, (eve)=>{this.end(eve)}, false);
        };
    };
    target(){
        // for (let i=0; i<=this.num; i++){
        //     let id = `separator${i}`
        //     let sep = document.getElementById(id);
        //     sep.addEventListener("dragover", (eve)=>this.over(eve), false);
        //     // sep.addEventListener("drop", (eve)=>this.drop(eve), false);
        // };
        document.getElementById("third").addEventListener("dragover", (eve)=>{this.over(eve), false});
    };
    /**クリック(長押し)の処理
     * @param {MouseEvent} event 
    */ 
    start(event){
        // this.spl_tr, this.spl_imgの更新(設定しないとクラス作成時のsplitValue4に固定)
        this.spl_img = event.target;
        this.spl_img.style.cursor = "grabbing"
        this.spl_tr = this.spl_img.parentNode.parentNode;
        this.spl_tr.classList.add("drag");
        this.spl_tr.draggable = true;
        // console.log(this.draggingID);
        // coordRangeXの設定
        let docThird = document.getElementById("third").getBoundingClientRect();
        this.coordRangeX = {
            left: docThird.left,
            right: docThird.right,
        };
        // splitVlaueの座標を取得
        this.getCoords();
        // console.log(event.pageX, event.pageY)
        // console.log(this.coordRangeX);
        // console.log(this.coordRangeYs);
        let n = parseInt(this.spl_tr.id.slice(10));
        this.sep_trsprnt = [n-1, n];
        this.index = n-1;
    };
    /**
     * ドラッグ中のイベント
     * @param {DragEvent} event 
     */
    drag(event){
        this.x = event.pageX;
        this.y = event.pageY;
        // console.log("----------------------")
        for (let i=this.index-1; i<=this.index+1; i++){
            if (i<0 | this.num<i){continue};
            let sep_id = `separator${i}`;
            let left = this.coordRangeX["left"];
            let right = this.coordRangeX["right"];
            let top = this.coordRangeYs[sep_id]["top"];
            let bottom = this.coordRangeYs[sep_id]["bottom"];
            if ((top<=this.y) && (this.y<bottom)){
                // console.log(i,"opaque")
                this.index = i;
                if (this.x<left | right<this.x){continue};
                if (this.sep_trsprnt.includes(this.index)){continue};
                this.changeOpacity(sep_id, 1);
            } else {
                // console.log(i,"transparent")
                this.changeOpacity(sep_id, 0.01);
            };
        };
    };
    /** ドラッグを終えて離したときorクリックを話したとき
     * @param {MouseEvent|DragEvent} event 
    */
    end(event){
        // console.log(event.target.id, event.type);
        this.spl_img.style.cursor = "grab"
        this.spl_tr.classList.remove("drag");
        this.spl_tr.draggable = false;

        let sep_id = `separator${this.index}`
        let opa = document.getElementById(sep_id).getElementsByTagName("img")[0].style.opacity;
        if (opa == "0"){return}
        this.sortValue(this.sep_trsprnt[1], this.index);
        this.changeOpacity(sep_id, 0)
    };
    /*-------------------------------------
                target = separator
    --------------------------------------*/
    /**
     * 
     * @param {DragEvent} event dragover
     */
    over(event){
        let top = this.coordRangeYs[`separator${0}`]["top"];
        let bottom = this.coordRangeYs[`separator${this.num}`]["bottom"];
        if (top<=this.y && this.y<=bottom){
            event.preventDefault()
        };
    };
    /*---------------------------------
                その他関数
    ---------------------------------*/
    /** クリックされたものを取得して，それをドラッグした際のseparatorの表示非表示を決める境界座標を返す */
    getCoords(){
        /**
         * separatorのY座標を返す
         * @param {number} num 
         * @returns {number}
         */
        let getCoord=(num)=>{return(window.scrollY+document.getElementById(`separator${num}`).getBoundingClientRect().top)};
        let sep = [getCoord(0), getCoord(this.num-1)];
        // splitValueの高さ
        let height = (sep[1]-sep[0])/(this.num-1);
        let res = {};
        for (let i=0; i<=this.num; i++){
            let cY = getCoord(i);
            let coord = {
                "top": cY-height/2,
                "bottom": cY+height/2,
            };
            res[`separator${i}`] = coord;
        };
        this.coordRangeYs = res;
    };
    /**
     * 透明度の変更
     * @param {string} id id
     * @param {number} param 0(transparent) < param < 1(opaque)
     */
    changeOpacity(id, param){
        document.getElementById(id).getElementsByTagName("img")[0].style.opacity = `${param}`;
    };
    /**
     * 
     * @param {number} bef drag from...
     * @param {number} aft drag to...
     */
    sortValue(bef, aft){
        this.sortList = [];
        let index = ((aft-bef)/Math.abs(aft-bef)); // 正方向移動で1, 逆方向移動で-1
        let min = Math.min(bef, aft)-(index-1)/2;
        let max = Math.max(bef, aft);
        // console.log(bef,aft);
        for (let i=min; i<=max; i++){
            let inp = document.getElementById(`splitValue${i}`).getElementsByTagName("input")[0];
            this.sortList.push(inp.value);
        };
        // console.log(this.sortList);
        let prev = this.sortList.slice(index, undefined);
        let folw = this.sortList.slice(undefined, index);
        this.sortList = prev.concat(folw)
        // console.log(this.sortList);
        for (let i=min; i<=max; i++){
            document.getElementById(`splitValue${i}`).getElementsByTagName("input")[0].value = this.sortList[i-min];
            convert(`splitValue${i}`);
        };
    };
};
/** inputResultで入力されたIDからLogBookページを開き、正しいIDか判断する関数 */
function openLog(){
    let id = document.getElementById("LogbookID").getElementsByTagName("input")[0].value;
    if (id == "") {
        alert("IDを入力してください");
    } else {
        console.log("ID :", id);
        let url = "https://log.concept2.com/profile/" + id + "/log";
        console.log("URL :", url);
        open(url);
    };
};
/** 
 * NameとDatetimeを入力可能/不可能にする
 * @param {Boolean} flag フラグ
 */
function zeroNext(flag){
    console.log("zeroNext>",flag)
    if (flag){
        let cnt = colorCheck(ZERO);
        console.log("ERROR",cnt)
        if (cnt != 0){
            alert("未記入の項目があります");
            return;
        } else {
            // 表示
            changeDisplay(["MT", "menuButton"], "revert");
            // 非表示
            changeDisplay(["zeroButton"], "none");
            // 入力不可
            changeDisabled(ZERO, true);
        };
    };
};
/** メニューの種類を選択した後に押すボタン */
function selectMenu(flag = true){
    console.log("selectMenu>", flag)
    if (flag){
        /** @type {HTMLCollectionOf<HTMLInputElement>} */
        let types = document.getElementsByName("Type");
        let onDisplay = [
            ["Distance", "Split"],
            ["Time", "Split"],
            ["Distance", "Rest", "Interval"],
            ["Time", "Rest", "Interval"],
        ];
        let cnt = 0;
        let i = 0;
        for (i = 0; i < types.length; i++){
            // console.log(i, types[i].checked)
            if (types[i].checked){
                cnt += 1;
                // すべての列を非表示
                changeDisplay(FIRST, "none")
                // 当該列を再表示
                changeDisplay(onDisplay[i], "revert")
            };
        };
        if (cnt == 0){
            alert("メニューの種類を選択してください");
            return;
        } else {
            //表示
            changeDisplay(["resultData", "first","firstButton"], "revert");
            //非表示
            changeDisplay(["menuButton"], "none");
            // 入力不可
            changeDisabled(["MT"], true);
            // tableの位置調整
            tabPos();
        };
    } else {
        // 再表示
        changeDisplay(["zeroButton"], "revert");
        // 非表示
        changeDisplay(["MT"], "none");
        // 入力許可
        changeDisabled(["base"], false);
    };
};
/** firstNext */
function firstNext(flag){
    console.log("firstNext>", flag);
    if (flag){
        // 空白チェック
        if (colorCheck(FIRST) != 0){
            alert("空欄があります");
            return;
        };
        changeDisplay(SECOND, "none");
        // ResultかAverageを表示
        if (ResAve()){
            changeDisplay(["Result", "Rate"], "revert");
        } else {
            changeDisplay(["Average", "Rate"], "revert");
        };
        // 表示
        changeDisplay(["second"], "revert");
        // 非表示
        changeDisplay(["firstButton"], "none");
        // 入力不可
        changeDisabled(FIRST, "revert");
    } else {
        // 再表示
        changeDisplay(["menuButton"], "revert");
        // 非表示
        changeDisplay(["resultData"], "none");
        // 入力許可
        changeDisabled(["MT"], false);

        zeroNext(true);
    };
};
/** 表のsecondが押された際にsplitの入力項目を表示する */
function secondNext(flag = true){
    console.log("secondNext>", flag);
    if (flag){
        // 空白チェック
        if (colorCheck(SECOND) != 0){
            alert("空欄があります");
            return;
        };
        // 入力するにチェックが入った状態にする
        document.getElementsByName("sp")[0].checked = true;
        // class = "splitValue"の数の検索
        let cnt = document.getElementsByClassName("splitValue").length;
        // Split/Intervalの表示するべき数
        let num = numSplInt();
        // console.log("exist:",cnt,"/create:",num)
        // 既にあるsplitValueの数が表示するべき数に一致する場合，追加過程をスキップ
        if (cnt != num){
            // 既にあるsplitValueを削除
            removeSpVal(cnt);
            // 表の入力欄のノードの作成
            let inp = document.createElement("input");
            inp.setAttribute("type", "text");
            inp.setAttribute("inputmode", "numeric");
            inp.setAttribute("maxlength", "6");
            inp.style.backgroundColor="lightpink";
            // sortPictureのノード作成
            let img = document.createElement("img");
            img.setAttribute("class", "sort-pic")
            img.setAttribute("src", "../svg/sortable.svg");
            img.setAttribute("alt", "SORT-UI-IMAGE");
            img.setAttribute("draggable", "false");
            // separatorの作成
            let sep_tr = document.createElement("tr");
            let sep_td = document.createElement("td");
            let sep = document.createElement("img");
            sep_tr.classList.add("separator");
            sep_td.setAttribute("colspan", "5");
            sep.setAttribute("src", "../svg/separator.svg");
            // sep.setAttribute("alt", "SEPARATE-LINE");
            sep_td.append(sep);
            sep_tr.append(sep_td);
            // 表のデータのノードを作成
            let td0 = document.createElement("td");
            let td2 = document.createElement("td");
            let td3 = document.createElement("td");
            let span0 = document.createElement("span");
            td0.append(img)
            td0.setAttribute("class", "col0");
            td2.append(inp);
            td3.setAttribute("class", "output");
            td3.setAttribute("colspan", "2")
            span0.textContent = "0";
            td3.append(span0.cloneNode(true), ":", span0.cloneNode(true), span0.cloneNode(true), ".", span0.cloneNode(true), "(", span0.cloneNode(true), span0.cloneNode(true), ")")
            changeSpan(td3.children[0], 0)
            // 親ノードの欠片を生成
            let parent = document.createDocumentFragment();
            // 繰り返し処理
            for (let i = 1; i <= num; i++) {
                // idの作成
                let id = "splitValue" + i;
                // 表の列のノードの作成
                let child_tr = document.createElement("tr");
                // child_tr.setAttribute("class", "input-short")
                // [戻る]ボタンをクリックしたときに入力欄をまとめて削除するためにクラスを命名(新規)
                child_tr.classList.add("splitValue", "col1")
                child_tr.setAttribute("id", id);
                child_tr.setAttribute("draggable", "false");
                // 1行目のデータのノードを新規作成
                let td1 = document.createElement("td");
                td1.append(i.toString());
                td2.getElementsByTagName("input")[0].setAttribute("oninput", `convert('${id}')`);
                td2.getElementsByTagName("input")[0].setAttribute("name", id)
                child_tr.append(td0.cloneNode(true), td1, td2.cloneNode(true), td3.cloneNode(true));
                sep_tr.setAttribute("id", `separator${i}`);
                parent.append(child_tr, sep_tr.cloneNode(true));
            };
            document.getElementById("third").children[2].after(parent);
            new sortSplit(num);
        };
        

        // 表示
        changeDisplay(THIRD, "revert");
        // 非表示
        changeDisplay(["secondButton"], "none");
        // 入力不可
        changeDisabled(SECOND, true);
        inputSplit(true)
    } else {
        // 再表示
        changeDisplay(["firstButton"], "revert");
        // 非表示
        changeDisplay(["second"], "none");
        // 入力許可
        changeDisabled(FIRST, false);
        selectMenu(true);
    };
};
/** 
 * class=splitValueの記入可否, input[type=radio]から呼び出し
 * @param {boolean} flag 
 */
function inputSplit(flag){
    console.log("inputSplit>",flag)
    function offSpVal(mark){
        for (let elem of document.getElementsByClassName("splitValue")) {
            elem.style.display = mark;
        };
    };
    flag ? offSpVal("revert") : offSpVal("none")
};
/** thirdの次へボタンの処理 */ 
function thirdNext(flag){
    console.log("thirdNext>",flag)
    if (flag){
        // 空白チェック
        let num = document.getElementsByClassName("splitValue").length;
        let cnt = 0;
        for (i=1; i<=num; i++){
            cnt += colorCheck(["splitValue"+i]);
        };
        if (cnt != 0){
            alert("空欄があります");
            return;
        };
        // 非表示
        changeDisplay(["thirdButton"], "none");
        // 入力不可
        changeDisabled(["third"], true);
        submitCheck();
    } else {
        // 再表示
        changeDisplay(["secondButton"], "revert");
        // 非表示
        changeDisplay(["third"], "none");
        // 記入許可
        changeDisabled(SECOND, false);
        firstNext(true);
    };
};
/** 
 * @param {string[]} idList list of id
 * @param {string} by Tag, Class,...
 * @param {string} name "input", "output", ...
 * @returns {string}
 */
function getValue(idList, by, name){
    /** @type {HTMLElement} */
    let doc
    /** @type {string} */
    let text
    /** @type {string} */
    let id
    let cnt=0
    for (id of idList){
        doc = document.getElementById(id)
        if(doc.style.display != "none"){
            cnt += 1;
            break;
        };
    };
    if (cnt == 0){return "None"}
    if (by == "Tag"){
        /** @type {HTMLCollectionOf<HTMLInputElement>} */
        let inps = doc.getElementsByTagName(name);
        if (inps.length > 1){
            for (let inp of inps){
                if (inp.checked){text = inp.value};
            };
        } else {text = inps[0].value;};
    } else if (by == "Class"){
        /** @type {HTMLElement} */
        let elem = doc.getElementsByClassName(name)[0];
        text = elem.innerText + ((id == "Distance")?"m":"");
    };
    return text;
};
function submitCheck(){

    let valueId = getValue(["LogbookID"], "Tag", "input");
    let valueDate = getValue(["trainDate"], "Tag", "input");
    let valueTime = getValue(["trainTime"], "Tag", "input");
    let valueType = getValue(["MT"], "Tag", "input");
    let valueMenu = getValue(["Distance", "Time"], "Class", "output");
    let valueRest = getValue(["Rest"], "Class", "output");
    let valueAverage = getValue(["Result", "Average"], "Class", "output");
    let valueRate = getValue(["Rate"], "Class", "output");
    let spNum = getValue(["Split", "Interval"], "Class", "output");
    let valueSplit = "";
    
    valueTime = valueDate.concat(" ", valueTime)
    if (valueType.endsWith("Distance")){
        while (valueMenu.startsWith("0")) {
            valueMenu=valueMenu.slice(1);
        };
    } else if (valueType.endsWith("Time")){
        while (valueMenu.startsWith("0") && valueMenu.length>4) {
            valueMenu=valueMenu.slice(1);
        };
    };
    if (valueType.startsWith("Interval")){valueMenu = spNum.concat("x", valueMenu, "/", valueRest, "r");};
    
    for (let i=1; i<=parseInt(spNum); i++){
        valueSplit = valueSplit.concat(getValue([`splitValue${i}`], "Class", "output"), "->")
    };
    if (valueSplit.includes("None")){valueSplit = "None"}
    valueSplit = valueSplit.slice(0, valueSplit.length-2);

    console.log(`ID\t\t\t${valueId}\nDateTime\t${valueTime}\nMenu\t\t${valueMenu}\nAverage\t\t${valueAverage}\nRate\t\t${valueRate}\nSplit\t\t${valueSplit}`)
    
    let form = document.getElementById("check");
    
    let items = {valueId, valueTime, valueType, valueMenu, valueAverage, valueRate, valueSplit};
    let keys = ["id","time","type","menu","average","rate","split"]

    for (let i=0; i<keys.length; i++){
        let id = Object.keys(items)[i]
        let doc = document.getElementById(id);
        let docVal = doc.getElementsByClassName("value")[0];
        /** @type {string} */
        let text = items[id];
        let parent = document.createDocumentFragment();
        let br = document.createElement("br");
        if (id=="valueSplit"){
            let splitArray = items[id].split("->");
            for (let spTxt of splitArray){
                parent.append(spTxt, br.cloneNode(true))
            };
            while (docVal.firstChild) {
                docVal.removeChild(docVal.firstChild);                
            };
            docVal.appendChild(parent);
        } else {
            docVal.textContent = text;
        };
        if(id=="valueAverage"){
            let sp=doc.getElementsByTagName("span")
            if(valueMenu=="2000m"){
                sp[0].style.display="none";sp[1].style.display="contents";
            } else {
                sp[0].style.display="contents";sp[1].style.display="none";
            };
        };
        jsonFile[keys[i]] = items[Object.keys(items)[i]];
    };
    console.log(jsonFile)
    form.style.display="revert";
};
/** @param {boolean} flag */
function post(flag) {
    let iframe = document.getElementsByTagName("iframe")[0];
    let docInner = iframe.contentDocument;
    const fetch_reset = () => {
        changeDisplayByClassNames(["load-ing"], "revert", docInner);
        changeDisplayByClassNames(["load-succ", "load-fail", "load-button"], "none", docInner);
    };
    const fetch_succeed = () => {
        changeDisplayByClassNames(["load-ing"], "none", docInner);
        changeDisplayByClassNames(["load-succ", "load-button"], "revert", docInner);
    };
    const fetch_fail = () => {
        changeDisplayByClassNames(["load-ing"], "none", docInner);
        changeDisplayByClassNames(["load-fail", "load-button"], "revert", docInner); 
    };
    fetch_reset();
    if (flag) {
        iframe.style.display = "revert";
        let url = "https://script.google.com/macros/s/AKfycbyvs3YIl5LycmkcVVLBQ7rPtVjDcClEH218dBS5sDk7TABC2Yf46of_2ghg0PsODeuU/exec";
        let data = JSON.stringify(jsonFile);
        let options = {
            "method":"POST",
            "headers":{
                "Accept":"application/json",
                "Content-Type":"text/plain",
            },
            "body":data,
            "mode":"cors",
        };
        fetch(url, options)
            .then(
                (response) => {
                    changeDisplayByClassNames(["load-ing"], "none", docInner);
                    if (response.ok){
                        console.log("Success<js>");
                        let jsonResponse = response.json();
                        console.log(jsonResponse);
                        jsonResponse.then((res)=>{
                            console.log(res);
                            if (res.status){
                                fetch_succeed();
                            } else {
                                fetch_fail();
                                docInner.getElementsByClassName("error-message")[0].textContent = res.message
                            }
                        })
                    } else {
                        fetch_fail();
                        console.log("failed<js>");
                    };
                },
                (response) => {
                    fetch_fail();
                    console.log("cannot fetch<js>");
                },
            );
    } else {
        iframe.style.display = "none";
        changeDisplay(["check"], "none");
        changeDisplay(["thirdButton"], "revert");
        changeDisabled(["third"], false);
    };
};
function rePost(){
    post(false);
    thirdNext(true);
};