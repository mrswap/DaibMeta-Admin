import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiAlignJustify,
  FiList,
  FiCornerUpLeft,
  FiCornerUpRight,
  FiImage,
  FiLink,
  FiLink2,
  FiTrash2,
  FiX,
  FiPlus,
  FiGrid,
  FiChevronsLeft,
  FiChevronsRight,
  FiSlash,
  FiArrowUp,
  FiArrowDown,
  FiArrowLeft,
  FiArrowRight,
} from "react-icons/fi";

// ---------- helpers ----------

const TABLE_ID_ATTR = "data-tbl-id";

let tblCounter = 0;
const nextTableId = () => `tbl-${++tblCounter}-${Date.now()}`;

const cellStyleEven =
  "border:1px solid #9aa5b1;padding:10px 14px;min-width:80px;background:#ffffff;";
const cellStyleOdd =
  "border:1px solid #9aa5b1;padding:10px 14px;min-width:80px;background:#f4f6f9;";
const headStyle =
  "border:1px solid #1d4e6f;border-bottom:2px solid #9aa5b1;padding:12px 14px;text-align:left;font-weight:700;background:#1d4e6f;color:#ffffff;min-width:80px;";
const cellStyle = cellStyleEven;

function buildTableHTML(rows, cols, id) {
  let html = `<table ${TABLE_ID_ATTR}="${id}" class="custom-table" style="border-collapse:collapse;border:1px solid #9aa5b1;width:100%;margin:14px 0;font-family:Arial, sans-serif;font-size:14px;"><tbody>`;
  for (let r = 0; r < rows; r++) {
    html += "<tr>";
    for (let c = 0; c < cols; c++) {
      if (r === 0) {
        html += `<th style="${headStyle}">Header ${c + 1}</th>`;
      } else {
        const style = r % 2 === 0 ? cellStyleEven : cellStyleOdd;
        html += `<td style="${style}">&nbsp;</td>`;
      }
    }
    html += "</tr>";
  }
  html += "</tbody></table><p><br></p>";
  return html;
}

function closest(node, selector) {
  while (node && node.nodeType !== 1) node = node.parentNode;
  return node ? node.closest(selector) : null;
}

function findCell(node) {
  return closest(node, "td,th");
}
function findRow(node) {
  return closest(node, "tr");
}
function findTable(node) {
  return closest(node, "table");
}
const yieldToBrowser = () =>
  new Promise((resolve) => requestAnimationFrame(() => resolve()));

const MAX_PASTE_HTML_LENGTH = 50_000_000; // ~50MB of raw HTML

const SKIP_STYLE_TAGS = new Set([
  "TABLE",
  "TBODY",
  "THEAD",
  "TR",
  "COL",
  "COLGROUP",
  "BR",
]);

const FRAME_BUDGET_MS = 8;

const ToolBtn = ({
  onMouseDown,
  title,
  active,
  children,
  danger,
  disabled,
}) => (
  <button
    type="button"
    title={title}
    disabled={disabled}
    onMouseDown={(e) => {
      e.preventDefault(); // keep selection alive
      onMouseDown(e);
    }}
    className={`inline-flex items-center justify-center h-8 min-w-8 px-1.5 rounded-md text-sm transition-colors border
      ${danger ? "text-red-600 hover:bg-red-50 border-transparent" : "text-gray-700 hover:bg-gray-200 border-transparent"}
      ${active ? "bg-indigo-100 text-indigo-700 border-indigo-300" : ""}
      ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-6 bg-gray-300 mx-1.5 shrink-0" />;

const ColorPickerBtn = ({
  title,
  color,
  onPick,
  onMouseDown,
  children,
  inputRef,
}) => (
  <div className="relative">
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onMouseDown();
        inputRef.current.click();
      }}
      className="inline-flex flex-col items-center justify-center h-8 w-9 rounded-md text-sm text-gray-700 hover:bg-gray-200 border border-transparent"
    >
      <span className="leading-none mb-1">{children}</span>
      <span
        className="block w-5 h-[3px] rounded-sm"
        style={{ backgroundColor: color }}
      />
    </button>
    <input
      ref={inputRef}
      type="color"
      value={color}
      onChange={(e) => onPick(e.target.value)}
      className="absolute inset-0 w-0 h-0 opacity-0 pointer-events-none"
      tabIndex={-1}
    />
  </div>
);

const CustomEditor = ({
  value = "",
  onChange = () => {},
  placeholder = "Start typing here...",
}) => {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const savedSelectionRef = useRef(null);
  const pasteInProgressRef = useRef(false);

  const historyRef = useRef([value || ""]);
  const historyIndexRef = useRef(0);
  const skipNextHistoryRef = useRef(false);
  const debounceRef = useRef(null);

  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isPasteLoading, setIsPasteLoading] = useState(false);
  const [pasteProgress, setPasteProgress] = useState(null); // { phase, done, total } | null

  const [activeTableId, setActiveTableId] = useState(null);
  const [toast, setToast] = useState(null);
  const [activeFormats, setActiveFormats] = useState({});

  const [textColor, setTextColor] = useState("#000000");
  const [highlightColor, setHighlightColor] = useState("#ffff00");

  const textColorInputRef = useRef(null);
  const highlightColorInputRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const flashToast = (msg) => {
    setToast(msg);
    window.clearTimeout(flashToast._t);
    flashToast._t = window.setTimeout(() => setToast(null), 1600);
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (
      sel &&
      sel.rangeCount > 0 &&
      editorRef.current.contains(sel.anchorNode)
    ) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    sel.removeAllRanges();
    if (savedSelectionRef.current) {
      sel.addRange(savedSelectionRef.current);
    } else {
      editorRef.current.focus();
    }
  };
  const restoreSelectionRange = () => {
    const sel = window.getSelection();
    sel.removeAllRanges();
    if (savedSelectionRef.current) {
      sel.addRange(savedSelectionRef.current);
      return savedSelectionRef.current;
    }
    editorRef.current.focus();
    return null;
  };

  const updateActiveFormats = () => {
    if (!editorRef.current) return;
    try {
      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        strikeThrough: document.queryCommandState("strikeThrough"),
        superscript: document.queryCommandState("superscript"),
        subscript: document.queryCommandState("subscript"),
        justifyLeft: document.queryCommandState("justifyLeft"),
        justifyCenter: document.queryCommandState("justifyCenter"),
        justifyRight: document.queryCommandState("justifyRight"),
        justifyFull: document.queryCommandState("justifyFull"),
        insertUnorderedList: document.queryCommandState("insertUnorderedList"),
        insertOrderedList: document.queryCommandState("insertOrderedList"),
      });
    } catch {}
  };

  const pushHistory = useCallback(() => {
    if (skipNextHistoryRef.current) {
      skipNextHistoryRef.current = false;
      return;
    }
    const html = editorRef.current.innerHTML;
    const hist = historyRef.current;
    const idx = historyIndexRef.current;
    if (hist[idx] === html) return;
    const trimmed = hist.slice(0, idx + 1);
    trimmed.push(html);
    historyRef.current = trimmed.slice(-100);
    historyIndexRef.current = historyRef.current.length - 1;
  }, []);

  const scheduleHistory = useCallback(() => {
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(pushHistory, 400);
  }, [pushHistory]);

  const notifyContentChanged = useCallback(() => {
    scheduleHistory();
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [scheduleHistory, onChange]);

  const applyHTMLSnapshot = (html) => {
    skipNextHistoryRef.current = true;
    editorRef.current.innerHTML = html;
    onChange(editorRef.current.innerHTML);
  };

  const undo = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      applyHTMLSnapshot(historyRef.current[historyIndexRef.current]);
    }
  };

  const redo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      applyHTMLSnapshot(historyRef.current[historyIndexRef.current]);
    }
  };

  const applyFormat = (command, value = null) => {
    editorRef.current.focus();
    restoreSelection();
    document.execCommand(command, false, value);
    notifyContentChanged();
    updateActiveFormats();
  };

  const insertHTMLAtCursor = (html) => {
    restoreSelection();
    editorRef.current.focus();
    document.execCommand("insertHTML", false, html);
    notifyContentChanged();
  };

  const clearSelectionAndFormatting = () => {
    restoreSelection();
    try {
      document.execCommand("removeFormat", false, null);
    } catch {}
    const sel = window.getSelection();
    if (sel) sel.removeAllRanges();
    savedSelectionRef.current = null;
    setActiveFormats({});
    editorRef.current.focus();
    notifyContentChanged();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsImageLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      insertHTMLAtCursor(
        `<img src="${event.target.result}" alt="Uploaded image" style="max-width:100%;border-radius:4px;" />`,
      );
      setIsImageLoading(false);
    };
    reader.onerror = () => {
      setIsImageLoading(false);
      flashToast("Couldn't load that image — try a different file");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const buildStyleMaps = (doc) => {
    const classMap = new Map();
    const tagMap = new Map();
    const addTo = (map, key, cssText) => {
      const existing = map.get(key);
      map.set(key, existing ? `${existing};${cssText}` : cssText);
    };
    doc.querySelectorAll("style").forEach((styleEl) => {
      try {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(styleEl.textContent || "");
        for (const rule of sheet.cssRules) {
          if (!rule.selectorText || !rule.style || !rule.style.cssText)
            continue;
          rule.selectorText.split(",").forEach((rawSel) => {
            const sel = rawSel.trim();
            const classMatch = sel.match(/^\.([\w-]+)$/);
            if (classMatch) {
              addTo(classMap, classMatch[1], rule.style.cssText);
              return;
            }
            const tagMatch = sel.match(/^([a-zA-Z][\w-]*)$/);
            if (tagMatch) {
              addTo(tagMap, tagMatch[1].toUpperCase(), rule.style.cssText);
              return;
            }
            const compoundMatch = sel.match(/^([a-zA-Z][\w-]*)\.([\w-]+)$/);
            if (compoundMatch) {
              addTo(classMap, compoundMatch[2], rule.style.cssText);
            }
            const multiClassMatch = sel.match(/\.([\w-]+)/g);

            if (multiClassMatch) {
              multiClassMatch.forEach((m) => {
                addTo(classMap, m.substring(1), rule.style.cssText);
              });
            }
          });
        }
      } catch {}
    });

    return { classMap, tagMap };
  };

  function bytesToBinaryString(bytes) {
    const CHUNK = 8192;
    let result = "";
    for (let i = 0; i < bytes.length; i += CHUNK) {
      const chunk = bytes.subarray(i, i + CHUNK);
      result += String.fromCharCode.apply(null, chunk);
    }
    return result;
  }

  const extractImagesFromRtf = (rtf) => {
    if (!rtf) return [];
    const images = [];
    let searchFrom = 0;

    while (true) {
      const start = rtf.indexOf("{\\pict", searchFrom);
      if (start === -1) break;

      let depth = 0;
      let end = -1;
      for (let i = start; i < rtf.length; i++) {
        if (rtf[i] === "{") depth++;
        else if (rtf[i] === "}") {
          depth--;
          if (depth === 0) {
            end = i;
            break;
          }
        }
      }
      if (end === -1) break;

      const block = rtf.slice(start, end + 1);
      searchFrom = end + 1;

      const kwMatch = block.match(/\\(pngblip|jpegblip)\b/);
      if (!kwMatch) {
        images.push(null);
        continue;
      }
      const mime = kwMatch[1] === "pngblip" ? "image/png" : "image/jpeg";
      let pos = kwMatch.index + kwMatch[0].length;
      while (pos < block.length) {
        while (pos < block.length && /\s/.test(block[pos])) pos++;
        if (block[pos] === "\\") {
          const m = /^\\[a-zA-Z]+-?\d*/.exec(block.slice(pos));
          if (m && m[0].length > 1) {
            pos += m[0].length;
            continue;
          }
          pos++; // unrecognized escape - skip just the backslash
          continue;
        }
        break; // reached the real start of the hex data
      }

      const hex = block
        .slice(pos)
        .replace(/\{[^{}]*\}/g, "") // strip any trailing nested groups
        .replace(/[^0-9a-fA-F]/g, ""); // keep hex digits only

      if (hex.length < 40) {
        images.push(null);
        continue;
      }

      try {
        const byteLen = hex.length >> 1;
        const bytes = new Uint8Array(byteLen);
        for (let i = 0; i < byteLen; i++) {
          bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
        }
        const binary = bytesToBinaryString(bytes);
        images.push(`data:${mime};base64,${btoa(binary)}`);
      } catch {
        images.push(null);
      }
    }

    return images;
  };

  const fixWordImageSrcs = (doc, rtfImages) => {
    let rtfIdx = 0;
    const nextRtfImage = () => {
      while (rtfIdx < rtfImages.length) {
        const img = rtfImages[rtfIdx];
        rtfIdx++;
        if (img) return img;
      }
      return null;
    };

    doc.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (/^file:\/\//i.test(src)) {
        const dataUrl = nextRtfImage();
        if (dataUrl) {
          img.setAttribute("src", dataUrl);
        } else {
          // No RTF bytes matched — can't recover the image, so drop just
          // this one broken reference (not all images).
          img.remove();
        }
      }
    });

    doc.querySelectorAll("imagedata, v\\:imagedata").forEach((vImg) => {
      const src = vImg.getAttribute("src") || vImg.getAttribute("o:href") || "";
      if (!/^file:\/\//i.test(src)) return;

      const dataUrl = nextRtfImage();
      if (!dataUrl) return; // ← remove() hata do, bas skip kar do

      const shape = vImg.closest("shape, v\\:shape");
      const target = shape || vImg;
      const newImg = doc.createElement("img");
      newImg.setAttribute("src", dataUrl);
      newImg.setAttribute("style", "max-width:100%;");
      target.parentNode.replaceChild(newImg, target);
    });
  };

  const removeVmlGroupFallbackImages = (doc) => {
    doc.querySelectorAll("img").forEach((img) => {
      const shapesAttr = img.getAttribute("v:shapes") || "";
      // Only remove if it's a GROUP fallback (heading/textbox decorative box),
      // not a real inline Picture image.
      if (/\bGroup_x0020_/i.test(shapesAttr)) {
        img.remove();
      }
    });
  };

  const removeEmptyVmlShapes = (doc) => {
    doc.querySelectorAll("shape, v\\:shape").forEach((shape) => {
      if (!shape.querySelector("imagedata, v\\:imagedata, img")) {
        shape.remove();
      }
    });
  };

  const convertWordListsToHtmlLists = (doc) => {
    const isWordBulletPara = (p) => {
      const style = p.getAttribute("style") || "";
      return (
        /mso-list\s*:/i.test(style) &&
        p.querySelector("span[style*='mso-list:Ignore' i]")
      );
    };

    // Sirf ye elements ek list-group ko genuinely todte hain (heading, hr,
    // table). Beech mein koi bhi wrapper <div>/<span> (jaise Word ke
    // border-box continuation divs) aaye to unhe ignore karo — chahe
    // paragraphs literal DOM siblings na ho, sirf actual "content break"
    // maayne rakhta hai. Ye document-order based check hai, isliye kisi
    // bhi tarah ki nesting me reliably kaam karta hai.
    const breakerEls = Array.from(
      doc.body.querySelectorAll("h1, h2, h3, h4, h5, h6, hr, table"),
    );

    const isBetween = (a, b, node) => {
      const afterA =
        a.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING;
      const beforeB =
        node.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING;
      return !!afterA && !!beforeB;
    };

    const hasBreakBetween = (prevPara, nextPara) =>
      breakerEls.some((el) => isBetween(prevPara, nextPara, el));

    const paragraphs = Array.from(doc.body.querySelectorAll("p"));
    let i = 0;
    while (i < paragraphs.length) {
      const p = paragraphs[i];
      if (!p.isConnected || !isWordBulletPara(p)) {
        i++;
        continue;
      }

      const markerSpan = p.querySelector("span[style*='mso-list:Ignore' i]");
      const markerText = (markerSpan.textContent || "").trim();
      const isOrdered = /^\d+[.)]/.test(markerText);
      const listEl = doc.createElement(isOrdered ? "ol" : "ul");

      const firstStyle = p.getAttribute("style") || "";
      const ulBgMatch = firstStyle.match(/background(?:-color)?\s*:\s*[^;]+/i);
      const mlMatch = firstStyle.match(/margin-left\s*:\s*(-?[\d.]+)pt/i);
      const indentPx = mlMatch
        ? Math.max(0, (parseFloat(mlMatch[1]) * 96) / 72)
        : 24;

      let ulStyle = `padding-left:${indentPx.toFixed(1)}px;margin:0.5em 0;`;
      if (ulBgMatch) {
        ulStyle += `${ulBgMatch[0]};padding-top:6px;padding-bottom:6px;`;
      }
      listEl.setAttribute("style", ulStyle);

      let j = i;
      let anchorForInsert = p;
      while (j < paragraphs.length && isWordBulletPara(paragraphs[j])) {
        if (j > i && hasBreakBetween(paragraphs[j - 1], paragraphs[j])) {
          break;
        }

        const cur = paragraphs[j];

        const ignoreSpan = cur.querySelector(
          "span[style*='mso-list:Ignore' i]",
        );
        if (ignoreSpan) {
          let wrapper = ignoreSpan;
          // Sirf tab tak upar jao jab tak wrapper apne parent ka EKLAUTA
          // (only) child ho — matlab parent ke andar aur koi real content
          // (jaise actual text) nahi hai. Jaise hi koi wrapper mile jiske
          // sibling mein real text ho (jaise bookmark span jisme text bhi
          // hai), wahin ruk jao — taaki wo text delete na ho.
          while (
            wrapper.parentNode &&
            wrapper.parentNode !== cur &&
            wrapper.parentNode.children.length === 1
          ) {
            wrapper = wrapper.parentNode;
          }
          if (wrapper && wrapper.parentNode) wrapper.remove();
        }

        const li = doc.createElement("li");
        if (ulBgMatch) li.setAttribute("style", "margin:2px 0;");
        while (cur.firstChild) li.appendChild(cur.firstChild);
        listEl.appendChild(li);

        j++;
      }

      anchorForInsert.parentNode.insertBefore(listEl, anchorForInsert);
      for (let k = i; k < j; k++) {
        if (paragraphs[k].parentNode) paragraphs[k].remove();
      }
      i = j;
    }
  };

  const propagateCellBackgrounds = (doc) => {
    doc.querySelectorAll("td, th").forEach((cell) => {
      const cellStyle = cell.getAttribute("style") || "";
      const bgMatch = cellStyle.match(/background(?:-color)?\s*:\s*([^;]+)/i);
      const bgColor = bgMatch
        ? bgMatch[1].trim()
        : cell.getAttribute("bgcolor")
          ? cell.getAttribute("bgcolor").trim()
          : null;
      if (!bgColor) return;

      if (!bgMatch) {
        const sep = cellStyle && !cellStyle.trim().endsWith(";") ? "; " : "";
        cell.setAttribute(
          "style",
          `${cellStyle}${sep}background-color:${bgColor};`,
        );
      }

      Array.from(cell.children).forEach((child) => {
        const existing = child.getAttribute("style") || "";
        if (/background(?:-color)?\s*:/i.test(existing)) return;
        const sep = existing && !existing.trim().endsWith(";") ? "; " : "";
        child.setAttribute(
          "style",
          `${existing}${sep}background-color:${bgColor};`,
        );
      });
    });
  };

  // Word ke "callout box" jaisa div (background-color + border) jiska
  // apna left-padding bahut kam hota hai (jaise 2pt) — usse thoda zyada
  // insetdo, taaki text/bullets left border se chipke na dikhein.
  const toPxUnit = (val, unit) => {
    if (unit === "px") return val;
    if (unit === "pt") return (val * 96) / 72;
    if (unit === "cm") return (val * 96) / 2.54;
    return val;
  };

  const ensureCalloutBoxIndent = (doc) => {
    const MIN_PAD_LEFT_PX = 16;

    doc.querySelectorAll("div").forEach((div) => {
      const style = div.getAttribute("style") || "";
      const hasBg = /background(?:-color)?\s*:\s*(?!transparent\b)[^;]+/i.test(
        style,
      );
      const hasBorder = /\bborder(?:-left)?\s*:\s*[^;]*\d/i.test(style);
      if (!hasBg || !hasBorder) return;

      let currentPx = 0;
      const longhand = style.match(/padding-left\s*:\s*([\d.]+)(pt|px|cm)/i);
      if (longhand) {
        currentPx = toPxUnit(parseFloat(longhand[1]), longhand[2]);
      } else {
        const shorthand = style.match(/(?:^|;)\s*padding\s*:\s*([^;]+)/i);
        if (shorthand) {
          const parts = shorthand[1].trim().split(/\s+/);
          const leftPart =
            parts.length >= 4 ? parts[3] : parts[parts.length - 1];
          const m = leftPart.match(/([\d.]+)(pt|px|cm)/i);
          if (m) currentPx = toPxUnit(parseFloat(m[1]), m[2]);
        }
      }

      if (currentPx < MIN_PAD_LEFT_PX) {
        const cleaned = style.replace(/padding-left\s*:\s*[^;]+;?/i, "");
        const sep = cleaned && !cleaned.trim().endsWith(";") ? "; " : "";
        div.setAttribute(
          "style",
          `${cleaned}${sep}padding-left:${MIN_PAD_LEFT_PX}px;`,
        );
      }
    });
  };

  const rescueHeadingsFromTables = (doc) => {
    const markers = doc.body.querySelectorAll(
      "[data-recovered-heading], [data-recovered-divider]",
    );
    markers.forEach((el) => {
      const tbl = el.closest("table");
      if (!tbl || !tbl.parentNode) return;
      tbl.parentNode.insertBefore(el, tbl);
    });
  };

  const diagnoseClipboard = (rawHtml) => {
    const hasTable = /<table/i.test(rawHtml);
    const hasBgStyle = /background(?:-color)?\s*:/i.test(rawHtml);
    const hasBgColorAttr = /bgcolor\s*=/i.test(rawHtml);
    const hasWhiteColor = /color:\s*(white|#fff\b|#ffffff)/i.test(rawHtml);
  };

  const moveNodesTimeBudgeted = async (
    sourceContainer,
    targetParent,
    refNode,
    onProgress,
  ) => {
    const total = sourceContainer.childNodes.length;
    let done = 0;

    const bigFrag = document.createDocumentFragment();
    while (sourceContainer.firstChild) {
      const start = performance.now();
      while (
        sourceContainer.firstChild &&
        performance.now() - start < FRAME_BUDGET_MS
      ) {
        bigFrag.appendChild(sourceContainer.firstChild);
        done++;
      }
      onProgress && onProgress(done, total);
      await yieldToBrowser(); // let the browser paint/respond to input
    }
    targetParent.insertBefore(bigFrag, refNode);
  };

  const stripWordCruft = (html) =>
    html
      .replace(/<!--\[if[\s\S]*?<!\[endif\]-->/gi, "")
      .replace(/<xml>[\s\S]*?<\/xml>/gi, "")
      .replace(/<o:p>\s*<\/o:p>/gi, "")
      .replace(/<o:p>/gi, "")
      .replace(/<\/o:p>/gi, "")

      .replace(/<span[^>]*mso-ignore:vglayout[^>]*>[\s\S]*?<\/span>/gi, "")
      .replace(/<br[^>]*mso-ignore:vglayout[^>]*>/gi, "");

  function normalizeWordIndent(el) {
    const style = el.getAttribute("style") || "";
    const mlMatch = style.match(/margin-left\s*:\s*(-?[\d.]+)pt/i);
    const tiMatch = style.match(/text-indent\s*:\s*(-?[\d.]+)pt/i);
    if (!mlMatch && !tiMatch) return;
    const PT_TO_PX = 96 / 72; // = 1.3333...
    let newStyle = style
      .replace(/margin-left\s*:\s*-?[\d.]+pt;?/gi, "")
      .replace(/text-indent\s*:\s*-?[\d.]+pt;?/gi, "");

    // 👇 yehi fix hai — trailing semicolon ensure karo
    if (newStyle && !newStyle.trim().endsWith(";")) {
      newStyle += ";";
    }

    if (mlMatch) {
      const px = parseFloat(mlMatch[1]) * PT_TO_PX;
      newStyle += `margin-left:${px.toFixed(2)}px;`;
    }
    if (tiMatch) {
      const px = parseFloat(tiMatch[1]) * PT_TO_PX;
      newStyle += `text-indent:${px.toFixed(2)}px;`;
    }
    el.setAttribute("style", newStyle);
  }

  const processNodesTimeBudgeted = async (allEls, styleMaps, onProgress) => {
    const { classMap, tagMap } = styleMaps;
    const total = allEls.length;
    let i = 0;
    while (i < total) {
      const start = performance.now();
      while (i < total && performance.now() - start < FRAME_BUDGET_MS) {
        const el = allEls[i];
        if (!SKIP_STYLE_TAGS.has(el.tagName)) {
          const pieces = [];

          const tagCss = tagMap.get(el.tagName);
          if (tagCss) pieces.push(tagCss);

          const cls = el.getAttribute("class");
          if (cls && classMap.size) {
            cls.split(/\s+/).forEach((c) => {
              const css = classMap.get(c);
              if (css) pieces.push(css);
            });
          }

          if (pieces.length) {
            const existing = el.getAttribute("style") || "";
            const combined = existing
              ? `${pieces.join(";")};${existing}`
              : pieces.join(";");
            el.setAttribute("style", combined);
          }

          const finalStyle = el.getAttribute("style") || "";
          if (
            /color:\s*(white|#fff\b|#ffffff)/i.test(finalStyle) &&
            !/background(?:-color)?\s*:/i.test(finalStyle)
          ) {
            el.setAttribute(
              "style",
              `${finalStyle};background-color:#1d4e6f;padding:4px 8px;`,
            );
          }
          normalizeWordIndent(el);
        }
        el.removeAttribute("lang");
        el.removeAttribute("align");
        el.removeAttribute("xmlns:v");
        el.removeAttribute("xmlns:o");
        i++;
      }
      onProgress && onProgress(i, total);
      await yieldToBrowser();
    }
  };

  const cleanPastedHTML = async (rawHtml, rawRtf, onProgress) => {
    if (rawHtml.length > MAX_PASTE_HTML_LENGTH) {
      return null; // signal caller to use the regex-only fallback
    }

    try {
      const html = stripWordCruft(rawHtml);
      diagnoseClipboard(rawHtml);
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      if (!doc.body || !doc.body.firstChild) {
        return null; // parsing produced nothing usable - let caller fall back
      }

      const rtfImages = extractImagesFromRtf(rawRtf);
      if (rtfImages.length) {
        fixWordImageSrcs(doc, rtfImages);
      }

      removeVmlGroupFallbackImages(doc);
      removeEmptyVmlShapes(doc);
      convertWordListsToHtmlLists(doc);
      propagateCellBackgrounds(doc);
      ensureCalloutBoxIndent(doc);

      const rtfColorTable = [null]; // index 0 = "auto" / no explicit color
      if (rawRtf) {
        const ctMatch = rawRtf.match(/\{\\colortbl;([\s\S]*?)\}/);
        if (ctMatch) {
          const entries = ctMatch[1].split(";");
          entries.forEach((entry) => {
            const r = entry.match(/\\red(\d+)/);
            const g = entry.match(/\\green(\d+)/);
            const b = entry.match(/\\blue(\d+)/);
            if (r && g && b) {
              const hex = `#${[r[1], g[1], b[1]]
                .map((n) => parseInt(n, 10).toString(16).padStart(2, "0"))
                .join("")}`;
              rtfColorTable.push(hex);
            } else if (entry.trim() === "") {
              rtfColorTable.push(null); // auto/black entry
            }
          });
        }
      }

      const shapeParagraphIndex = new Map(); // shpStart -> paragraphIndexBefore
      const shapeDebugLog = []; // { shpStart, paraCountAtThatPoint }
      if (rawRtf) {
        let pos = 0;
        let paraCount = 0;
        const n = rawRtf.length;
        while (pos < n) {
          if (rawRtf.startsWith("{\\shp", pos)) {
            let depth = 0;
            let j = pos;
            let shpEnd = -1;
            for (; j < n; j++) {
              if (rawRtf[j] === "{") depth++;
              else if (rawRtf[j] === "}") {
                depth--;
                if (depth === 0) {
                  shpEnd = j;
                  break;
                }
              }
            }
            if (shpEnd === -1) break;
            shapeParagraphIndex.set(pos, paraCount);
            shapeDebugLog.push({
              shpStart: pos,
              paraCountAtThatPoint: paraCount,
            });
            pos = shpEnd + 1;
            continue;
          }
          if (
            rawRtf.startsWith("\\par", pos) &&
            !/[a-zA-Z]/.test(rawRtf[pos + 4] || "")
          ) {
            paraCount++;
            pos += 4;
            continue;
          }
          pos++;
        }
      }

      const shapeTexts = []; // { text, bgColor, textColor, borderColor, fontSizePx, align, paragraphIndex, rtfOrder }
      const dividerMarkers = []; // { paragraphIndex, rtfOrder, used }
      if (rawRtf) {
        let searchFrom = 0;
        let rtfOrder = 0;
        while (true) {
          const shpStart = rawRtf.indexOf("{\\shp", searchFrom);
          if (shpStart === -1) break;

          let depth = 0;
          let shpEnd = -1;
          for (let i = shpStart; i < rawRtf.length; i++) {
            if (rawRtf[i] === "{") depth++;
            else if (rawRtf[i] === "}") {
              depth--;
              if (depth === 0) {
                shpEnd = i;
                break;
              }
            }
          }
          if (shpEnd === -1) break;
          const shapeGroup = rawRtf.slice(shpStart, shpEnd + 1);
          searchFrom = shpEnd + 1;

          // fill color: Windows COLORREF integer 0x00BBGGRR
          let bgColor = null;
          const fillMatch = shapeGroup.match(
            /\{\\sp\{\\sn fillColor\}\{\\sv (\d+)\}\}/,
          );
          if (fillMatch) {
            const val = parseInt(fillMatch[1], 10);
            const r = val & 0xff;
            const g = (val >> 8) & 0xff;
            const b = (val >> 16) & 0xff;
            bgColor = `#${[r, g, b]
              .map((x) => x.toString(16).padStart(2, "0"))
              .join("")}`;
          }

          // border/line color of the shape - draws the vertical accent bar
          let borderColor = null;
          const lineColorMatch = shapeGroup.match(
            /\{\\sp\{\\sn lineColor\}\{\\sv (\d+)\}\}/,
          );
          const fLineMatch = shapeGroup.match(
            /\{\\sp\{\\sn fLine\}\{\\sv (\d+)\}\}/,
          );
          const lineIsOn = !fLineMatch || fLineMatch[1] !== "0";
          if (lineColorMatch && lineIsOn) {
            const val = parseInt(lineColorMatch[1], 10);
            const r = val & 0xff;
            const g = (val >> 8) & 0xff;
            const b = (val >> 16) & 0xff;
            borderColor = `#${[r, g, b]
              .map((x) => x.toString(16).padStart(2, "0"))
              .join("")}`;
          }

          const txtStart = shapeGroup.indexOf("{\\shptxt");
          if (txtStart === -1) {
            const fFilledMatch = shapeGroup.match(
              /\{\\sp\{\\sn fFilled\}\{\\sv (\d+)\}\}/,
            );
            const hasFillProp = /\{\\sp\{\\sn fillColor\}/.test(shapeGroup);
            const isActuallyFilled = fFilledMatch
              ? fFilledMatch[1] !== "0"
              : hasFillProp;

            if (!isActuallyFilled) {
              dividerMarkers.push({
                paragraphIndex: shapeParagraphIndex.has(shpStart)
                  ? shapeParagraphIndex.get(shpStart)
                  : rtfOrder,
                rtfOrder: rtfOrder++,
                used: false,
              });
            }
            continue;
          }

          let tdepth = 0;
          let txtEnd = -1;
          for (let i = txtStart; i < shapeGroup.length; i++) {
            if (shapeGroup[i] === "{") tdepth++;
            else if (shapeGroup[i] === "}") {
              tdepth--;
              if (tdepth === 0) {
                txtEnd = i;
                break;
              }
            }
          }
          if (txtEnd === -1) continue;

          const block = shapeGroup.slice(txtStart, txtEnd + 1);
          const looksLikePageField =
            /\\\*\s*PAGE\b/i.test(block) ||
            /\\fldinst[^}]*\bPAGE\b/i.test(block) ||
            /\\fldinst[^}]*\bNUMPAGES\b/i.test(block);
          if (looksLikePageField) {
            continue;
          }

          let textColor = null;
          const cfMatch = block.match(/\\cf(\d+)/);
          if (cfMatch) {
            const idx = parseInt(cfMatch[1], 10);
            textColor = rtfColorTable[idx] || null;
          }

          let fontSizePx = 16;
          const fsMatch = block.match(/\\fs(\d+)/);
          if (fsMatch) {
            const pt = parseInt(fsMatch[1], 10) / 2;
            fontSizePx = Math.round(pt * 1.333);
          }

          let align = "left";
          if (/\\qc\b/.test(block)) align = "center";
          else if (/\\qr\b/.test(block)) align = "right";
          else {
            const liMatch = block.match(/\\li(-?\d+)/);
            const fiMatch = block.match(/\\fi(-?\d+)/);
            if (liMatch && fiMatch) {
              const li = parseInt(liMatch[1], 10);
              const fi = parseInt(fiMatch[1], 10);
              if (li > 0 && fi < 0 && Math.abs(fi) > li * 0.3) {
                align = "center";
              }
            }
          }
          const text = block
            .replace(/\\par\b/g, " ")
            .replace(/\\line\b/g, " ")
            .replace(/\\'([0-9a-fA-F]{2})/g, (_, hex) =>
              String.fromCharCode(parseInt(hex, 16)),
            )
            .replace(/\{\\pict[\s\S]*?\}/g, "")
            .replace(/\\[a-zA-Z]+-?\d*\s?/g, "")
            .replace(/[{}]/g, "")
            .replace(/\s+/g, " ")
            .trim();

          if (text.length > 0) {
            shapeTexts.push({
              text,
              bgColor,
              textColor,
              borderColor,
              fontSizePx,
              align,
              paragraphIndex: shapeParagraphIndex.has(shpStart)
                ? shapeParagraphIndex.get(shpStart)
                : rtfOrder, // fallback if map lookup somehow misses
              rtfOrder: rtfOrder++,
              shpStart, // 🔍 TEMP DEBUG: keep raw byte offset for logging below
            });
          }
        }
      }

      const shapeTextFreq = new Map();
      shapeTexts.forEach((s) => {
        const key = s.text.trim().toLowerCase();
        shapeTextFreq.set(key, (shapeTextFreq.get(key) || 0) + 1);
      });
      const dedupedShapeTexts = shapeTexts.filter((s) => {
        const key = s.text.trim().toLowerCase();
        return shapeTextFreq.get(key) === 1;
      });

      if (dedupedShapeTexts.length) {
        const existingPlainText = (doc.body.textContent || "")
          .replace(/\s+/g, " ")
          .trim();

        const buildHeadingEl = ({
          text,
          bgColor,
          textColor,
          borderColor,
          fontSizePx,
          align,
        }) => {
          const heading = doc.createElement("p");
          const bg = bgColor || "transparent";

          let finalTextColor = textColor;
          if (!finalTextColor) {
            if (bgColor) {
              const r = parseInt(bgColor.slice(1, 3), 16);
              const g = parseInt(bgColor.slice(3, 5), 16);
              const b = parseInt(bgColor.slice(5, 7), 16);
              const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
              finalTextColor = luminance < 0.5 ? "#ffffff" : "#1a1a1a";
            } else {
              finalTextColor = "#1a1a1a";
            }
          }

          const accentColor = borderColor || finalTextColor || null;
          heading.setAttribute(
            "style",
            `background-color:${bg};color:${finalTextColor};font-weight:700;` +
              `font-size:${fontSizePx}px;padding:10px 16px;margin:0 0 8px 0;` +
              `text-align:${align};border-radius:2px;` +
              (accentColor ? `border-left:4px solid ${accentColor};` : "") +
              `white-space:normal;word-wrap:break-word;line-height:1.4;`,
          );
          heading.textContent = text;
          heading.setAttribute("data-recovered-heading", "1");
          return heading;
        };

        const isDividerElement = (el) => {
          if (el.tagName === "HR") return true;
          const style = el.getAttribute("style") || "";
          const hasText = (el.textContent || "").trim().length > 0;
          if (hasText) return false;
          if (/border-(top|bottom)\s*:\s*[^;]*\d/i.test(style)) return true;
          return Array.from(el.children || []).some((child) => {
            const cs = child.getAttribute("style") || "";
            return /border-(top|bottom)\s*:\s*[^;]*\d/i.test(cs);
          });
        };

        const queue = dedupedShapeTexts
          .map((s) => ({ ...s, text: s.text.replace(/\s+/g, " ").trim() }))
          .filter(
            (s) => s.text.length > 0 && !existingPlainText.includes(s.text),
          )
          .sort((a, b) => a.rtfOrder - b.rtfOrder);
        const candidates = Array.from(
          doc.body.querySelectorAll(
            "p, li, div, h1, h2, h3, h4, h5, h6, hr, table",
          ),
        ).filter((el) => el.tagName === "TABLE" || !el.closest("table"));
        const vmlAnchorCandidates = candidates.filter((el) =>
          /<!--\[if\s*!vml\]-->/i.test(el.innerHTML || ""),
        );
        const useVmlAnchors = vmlAnchorCandidates.length === queue.length;
        const sortedDividers = dividerMarkers
          .slice()
          .sort((a, b) => a.rtfOrder - b.rtfOrder);

        const findDividerFor = (shape) => {
          let best = null;
          for (const d of sortedDividers) {
            if (d.used) continue;
            if (d.paragraphIndex > shape.paragraphIndex) break;
            best = d;
          }
          if (best) best.used = true;
          return best;
        };

        queue.forEach((shape, shapeQueueIdx) => {
          let idx = useVmlAnchors
            ? candidates.indexOf(vmlAnchorCandidates[shapeQueueIdx])
            : Math.max(0, Math.min(shape.paragraphIndex, candidates.length));

          while (
            idx < candidates.length &&
            (candidates[idx].textContent || "").trim().length === 0 &&
            !isDividerElement(candidates[idx])
          ) {
            idx++;
          }

          if (idx < candidates.length && isDividerElement(candidates[idx])) {
            idx++;
          }
          const heading = buildHeadingEl(shape);
          const divider = findDividerFor(shape)
            ? doc.createElement("hr")
            : null;
          if (divider) divider.setAttribute("data-recovered-divider", "1");
          let insertionTarget = candidates[idx];
          if (
            insertionTarget &&
            (insertionTarget.tagName === "TD" ||
              insertionTarget.tagName === "TH")
          ) {
            const tbl = insertionTarget.closest("table");
            if (tbl && tbl.parentNode) {
              insertionTarget = tbl;
            }
          }
          if (insertionTarget && insertionTarget.parentNode) {
            if (divider) {
              insertionTarget.parentNode.insertBefore(divider, insertionTarget);
            }
            insertionTarget.parentNode.insertBefore(heading, insertionTarget);
          } else {
            if (divider) doc.body.appendChild(divider);
            doc.body.appendChild(heading);
          }
        });
        rescueHeadingsFromTables(doc);
      }

      const styleMaps = buildStyleMaps(doc);

      const container = document.createElement("div");
      container.style.cssText =
        "position:fixed;left:-9999px;top:0;width:800px;";
      while (doc.body.firstChild) container.appendChild(doc.body.firstChild);

      const allEls = container.querySelectorAll("*");
      await processNodesTimeBudgeted(
        allEls,
        styleMaps,
        (done, total) =>
          onProgress && onProgress({ phase: "cleaning", done, total }),
      );

      return container;
    } catch (e) {
      console.error("Error in cleanPastedHTML:", e);
      return null;
    }
  };

  const sanitizeOnly = (html, rtf) => {
    let bodyHtml = html;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      if (doc && doc.body) {
        const rtfImages = extractImagesFromRtf(rtf);
        if (rtfImages.length) fixWordImageSrcs(doc, rtfImages);
        bodyHtml = doc.body.innerHTML;
      }
    } catch {}
    return bodyHtml
      .replace(/<!--\[if[\s\S]*?<!\[endif\]-->/gi, "")
      .replace(/<o:p>\s*<\/o:p>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/\sxmlns:[a-z]+="[^"]*"/gi, "")
      .replace(/\sclass="[^"]*"/gi, "")
      .replace(/\slang="[^"]*"/gi, "")
      .replace(/mso-[^:;"]*:[^;"]*;?/gi, "");
  };

  const handlePaste = (e) => {
    if (pasteInProgressRef.current) {
      e.preventDefault();
      flashToast("Paste already in progress — please wait");
      return;
    }
    const html = e.clipboardData.getData("text/html");
    const rtf = e.clipboardData.getData("text/rtf");

    console.log(html);

    if (html) {
      e.preventDefault();

      pasteInProgressRef.current = true;
      setIsPasteLoading(true);
      setPasteProgress({ phase: "preparing", done: 0, total: 100 });

      saveSelection();

      Promise.resolve().then(async () => {
        try {
          await new Promise((r) => setTimeout(r, 50));

          setPasteProgress({ phase: "parsing", done: 0, total: 100 });
          await new Promise((r) => setTimeout(r, 10));

          const cleanedContainer = await cleanPastedHTML(html, rtf, (p) => {
            setPasteProgress(p);
          });

          // console.log("cleaned:", cleanedContainer?.innerHTML);

          if (cleanedContainer === null) {
            setPasteProgress({ phase: "sanitizing", done: 50, total: 100 });
            await new Promise((r) => setTimeout(r, 20));
            const sanitized = sanitizeOnly(html, rtf);
            setPasteProgress({ phase: "inserting", done: 75, total: 100 });
            await new Promise((r) => setTimeout(r, 10));
            restoreSelection();
            editorRef.current.focus();
            document.execCommand("insertHTML", false, sanitized);
            notifyContentChanged();
            setPasteProgress({ phase: "complete", done: 100, total: 100 });
          } else {
            setPasteProgress({ phase: "positioning", done: 50, total: 100 });
            await new Promise((r) => setTimeout(r, 20));
            const range = restoreSelectionRange();
            let targetParent = editorRef.current;
            let refNode = null;

            if (range) {
              range.deleteContents();
              if (range.startContainer.nodeType === Node.TEXT_NODE) {
                const textNode = range.startContainer;
                const after = textNode.splitText(range.startOffset);
                targetParent = textNode.parentNode;
                refNode = after;
              } else {
                targetParent = range.startContainer;
                refNode =
                  range.startContainer.childNodes[range.startOffset] || null;
              }
            }

            await moveNodesTimeBudgeted(
              cleanedContainer,
              targetParent,
              refNode,
              (done, total) => {
                const pct = Math.round(50 + (done / total) * 50);
                setPasteProgress({
                  phase: "inserting",
                  done: pct,
                  total: 100,
                });
              },
            );
            await new Promise((r) => setTimeout(r, 10));
            notifyContentChanged();
            setPasteProgress({ phase: "complete", done: 100, total: 100 });
          }
        } catch (err) {
          console.error("Paste error:", err);
          try {
            setPasteProgress({ phase: "fallback", done: 0, total: 100 });
            await new Promise((r) => setTimeout(r, 50));
            restoreSelection();
            editorRef.current.focus();
            const sanitized = sanitizeOnly(html, rtf);
            document.execCommand("insertHTML", false, sanitized);
            notifyContentChanged();
          } catch (e2) {
            console.error("Fallback paste failed:", e2);
            flashToast("Paste failed — try pasting as plain text");
          }
        } finally {
          await new Promise((r) => setTimeout(r, 200));
          setIsPasteLoading(false);
          setPasteProgress(null);
          pasteInProgressRef.current = false;
        }
      });

      return;
    }

    const items = e.clipboardData.items
      ? Array.from(e.clipboardData.items)
      : [];
    const imageItem = items.find(
      (item) => item.type && item.type.startsWith("image/"),
    );
    if (imageItem) {
      e.preventDefault();
      const file = imageItem.getAsFile();
      if (file) {
        setIsImageLoading(true);
        const reader = new FileReader();
        reader.onload = (event) => {
          insertHTMLAtCursor(
            `<img src="${event.target.result}" alt="Pasted image" style="max-width:100%;border-radius:4px;" />`,
          );
          setIsImageLoading(false);
        };
        reader.onerror = () => {
          setIsImageLoading(false);
          flashToast("Couldn't load that image — try again");
        };
        reader.readAsDataURL(file);
      }
      return;
    }

    const text = e.clipboardData.getData("text/plain");
    if (text) {
      e.preventDefault();
      document.execCommand("insertText", false, text);
      notifyContentChanged();
    }
  };

  const createCustomTable = () => {
    const rowsInput = prompt("Number of rows (including header):", "4");
    if (rowsInput === null) return;
    const colsInput = prompt("Number of columns:", "3");
    if (colsInput === null) return;

    const numRows = parseInt(rowsInput, 10);
    const numCols = parseInt(colsInput, 10);

    if (
      !Number.isInteger(numRows) ||
      !Number.isInteger(numCols) ||
      numRows < 1 ||
      numCols < 1
    ) {
      alert("Please enter valid whole numbers (1 or greater).");
      return;
    }
    if (numRows > 50 || numCols > 20) {
      alert("Please keep it under 50 rows and 20 columns.");
      return;
    }

    const id = nextTableId();
    insertHTMLAtCursor(buildTableHTML(numRows, numCols, id));
  };

  // ---- table mutation helpers ----
  const withActiveTable = (fn) => {
    if (!activeTableId || !editorRef.current) return;
    const table = editorRef.current.querySelector(
      `[${TABLE_ID_ATTR}="${activeTableId}"]`,
    );
    if (table) fn(table);
    notifyContentChanged();
  };

  const getCurrentCell = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    return findCell(sel.getRangeAt(0).startContainer);
  };

  const addRow = (position) => {
    const cell = getCurrentCell();
    const row = cell ? findRow(cell) : null;
    if (!row) return;
    const colCount = row.children.length;
    const newRow = document.createElement("tr");
    for (let i = 0; i < colCount; i++) {
      const td = document.createElement("td");
      td.setAttribute("style", cellStyle);
      td.innerHTML = "&nbsp;";
      newRow.appendChild(td);
    }
    if (position === "after") {
      row.parentNode.insertBefore(newRow, row.nextSibling);
    } else {
      row.parentNode.insertBefore(newRow, row);
    }
    notifyContentChanged();
  };

  const deleteRow = () => {
    const cell = getCurrentCell();
    const row = cell ? findRow(cell) : null;
    if (!row) return;
    const table = row.closest("table");
    const rowCount = table.querySelectorAll("tr").length;
    if (rowCount <= 1) {
      flashToast("Can't delete the last row — delete the table instead");
      return;
    }
    if (!confirm("Delete this row?")) return;
    row.remove();
    notifyContentChanged();
  };

  const addColumn = (position) => {
    const cell = getCurrentCell();
    if (!cell) return;
    const table = cell.closest("table");
    const colIndex = cell.cellIndex;
    const rows = table.querySelectorAll("tr");
    rows.forEach((row, ri) => {
      const tag = ri === 0 && row.children[0]?.tagName === "TH" ? "th" : "td";
      const newCell = document.createElement(tag);
      newCell.setAttribute("style", tag === "th" ? headStyle : cellStyle);
      newCell.innerHTML = tag === "th" ? `Header` : "&nbsp;";
      const ref =
        position === "after"
          ? row.children[colIndex + 1]
          : row.children[colIndex];
      row.insertBefore(newCell, ref || null);
    });
    notifyContentChanged();
  };

  const deleteColumn = () => {
    const cell = getCurrentCell();
    if (!cell) return;
    const table = cell.closest("table");
    const colIndex = cell.cellIndex;
    const rows = table.querySelectorAll("tr");
    if (rows[0].children.length <= 1) {
      flashToast("Can't delete the last column — delete the table instead");
      return;
    }
    if (!confirm("Delete this column?")) return;
    rows.forEach((row) => {
      if (row.children[colIndex]) row.children[colIndex].remove();
    });
    notifyContentChanged();
  };

  const deleteTable = () => {
    withActiveTable((table) => {
      if (
        confirm(
          "Delete this entire table? This can't be undone with undo... actually it can — Ctrl/Cmd+Z works.",
        )
      ) {
        table.remove();
        setActiveTableId(null);
      }
    });
  };

  // ---- detect when caret/click is inside a table ----
  const updateTableContext = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      setActiveTableId(null);
      return;
    }
    const node = sel.getRangeAt(0).startContainer;
    if (!editorRef.current || !editorRef.current.contains(node)) {
      setActiveTableId(null);
      return;
    }
    const table = findTable(node);
    if (table) {
      let id = table.getAttribute(TABLE_ID_ATTR);
      if (!id) {
        id = nextTableId();
        table.setAttribute(TABLE_ID_ATTR, id);
      }
      setActiveTableId(id);
    } else {
      setActiveTableId(null);
    }
  };

  const handleEditorClick = () => {
    saveSelection();
    updateTableContext();
    updateActiveFormats();
  };

  const handleEditorKeyUp = () => {
    saveSelection();
    updateTableContext();
    updateActiveFormats();
  };

  const handleInput = () => {
    saveSelection();
    scheduleHistory();
    updateActiveFormats();

    onChange(editorRef.current.innerHTML);
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      const meta = e.ctrlKey || e.metaKey;
      if (meta && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (
        meta &&
        (e.key.toLowerCase() === "y" ||
          (e.shiftKey && e.key.toLowerCase() === "z"))
      ) {
        e.preventDefault();
        redo();
      }
    };
    const node = editorRef.current;
    node?.addEventListener("keydown", onKeyDown);
    return () => node?.removeEventListener("keydown", onKeyDown);
  }, []);

  const insideTable = !!activeTableId;
  const anyFormatActive = Object.values(activeFormats).some(Boolean);
  const isLoading = isImageLoading || isPasteLoading;

  const pasteStatusLabel = (() => {
    if (!pasteProgress) return "Pasting content…";
    const pct = pasteProgress.total
      ? Math.round((pasteProgress.done / pasteProgress.total) * 100)
      : 0;
    const phaseLabel = (() => {
      switch (pasteProgress.phase) {
        case "preparing":
          return "Preparing";
        case "parsing":
          return "Parsing";
        case "cleaning":
          return "Cleaning";
        case "sanitizing":
          return "Sanitizing";
        case "positioning":
          return "Positioning";
        case "inserting":
          return "Inserting";
        case "fallback":
          return "Using fallback";
        case "complete":
          return "Complete";
        default:
          return "Processing";
      }
    })();
    return `${phaseLabel} content… ${pct}%`;
  })();

  return (
    <div className="w-full bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
      <style>{`
        .editor-content table.custom-table td:focus-within,
        .editor-content table.custom-table th:focus-within { outline: 2px solid #6366f1; outline-offset: -2px; }
        .editor-content table.custom-table { border-color: #e2e2e7; }
        .editor-content img { border-radius: 4px; }
        .editor-content:empty:before { content: attr(data-placeholder); color: #9ca3af; }
         .editor-content hr {
          border: none;
          border-top: 2px solid #d5dae1;
          margin: 16px 0;
          }
        .editor-content h1 { font-size: 2em; font-weight: 700; margin: 0.67em 0; line-height: 1.3; }
        .editor-content h2 { font-size: 1.5em; font-weight: 700; margin: 0.75em 0; line-height: 1.3; }
        .editor-content h3 { font-size: 1.25em; font-weight: 600; margin: 0.83em 0; line-height: 1.3; }
        .editor-content h4 { font-size: 1.1em; font-weight: 600; margin: 1em 0; line-height: 1.3; }
        .editor-content p { margin: 0.5em 0; }

        .editor-content ul { list-style: disc; padding-left: 1.5em; margin: 0.5em 0; }
        .editor-content ol { list-style: decimal; padding-left: 1.5em; margin: 0.5em 0; }
        .editor-content ul ul { list-style: circle; }
        .editor-content ul ul ul { list-style: square; }
        .editor-content li { display: list-item; margin: 0.25em 0; }

        .editor-content a { color: #2563eb; text-decoration: underline; cursor: pointer; }
        
      `}</style>

      {/* Toolbar */}
      <div className="border-b border-gray-200 p-2 bg-gray-50/80 sticky top-0 z-20">
        <div className="flex flex-wrap items-center gap-1">
          <select
            onMouseDown={saveSelection}
            onChange={(e) => applyFormat("fontName", e.target.value)}
            disabled={isPasteLoading}
            className="h-8 px-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
            defaultValue=""
          >
            <option value="" disabled>
              Font
            </option>
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Georgia">Georgia</option>
            <option value="Verdana">Verdana</option>
            <option value="Courier New">Courier New</option>
            <option value="Tahoma">Tahoma</option>
          </select>

          <select
            onMouseDown={saveSelection}
            onChange={(e) => applyFormat("fontSize", e.target.value)}
            disabled={isPasteLoading}
            className="h-8 px-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
            defaultValue=""
          >
            <option value="" disabled>
              Size
            </option>
            <option value="1">8</option>
            <option value="2">10</option>
            <option value="3">12</option>
            <option value="4">14</option>
            <option value="5">16</option>
            <option value="6">18</option>
            <option value="7">24</option>
          </select>

          <select
            onMouseDown={saveSelection}
            onChange={(e) => applyFormat("formatBlock", e.target.value)}
            disabled={isPasteLoading}
            className="h-8 px-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
            defaultValue="p"
          >
            <option value="p">Normal</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
          </select>

          <Divider />

          <ToolBtn
            title="Bold"
            active={activeFormats.bold}
            onMouseDown={() => applyFormat("bold")}
          >
            <FiBold size={15} />
          </ToolBtn>
          <ToolBtn
            title="Italic"
            active={activeFormats.italic}
            onMouseDown={() => applyFormat("italic")}
          >
            <FiItalic size={15} />
          </ToolBtn>
          <ToolBtn
            title="Underline"
            active={activeFormats.underline}
            onMouseDown={() => applyFormat("underline")}
          >
            <FiUnderline size={15} />
          </ToolBtn>
          <ToolBtn
            title="Strikethrough"
            active={activeFormats.strikeThrough}
            onMouseDown={() => applyFormat("strikeThrough")}
          >
            <span className="text-sm font-bold line-through">S</span>
          </ToolBtn>
          <ToolBtn
            title="Superscript"
            active={activeFormats.superscript}
            onMouseDown={() => applyFormat("superscript")}
          >
            <span className="text-xs font-semibold">X²</span>
          </ToolBtn>
          <ToolBtn
            title="Subscript"
            active={activeFormats.subscript}
            onMouseDown={() => applyFormat("subscript")}
          >
            <span className="text-xs font-semibold">X₂</span>
          </ToolBtn>

          <Divider />

          <ToolBtn
            title="Align left"
            active={activeFormats.justifyLeft}
            onMouseDown={() => applyFormat("justifyLeft")}
          >
            <FiAlignLeft size={15} />
          </ToolBtn>
          <ToolBtn
            title="Align center"
            active={activeFormats.justifyCenter}
            onMouseDown={() => applyFormat("justifyCenter")}
          >
            <FiAlignCenter size={15} />
          </ToolBtn>
          <ToolBtn
            title="Align right"
            active={activeFormats.justifyRight}
            onMouseDown={() => applyFormat("justifyRight")}
          >
            <FiAlignRight size={15} />
          </ToolBtn>
          <ToolBtn
            title="Justify"
            active={activeFormats.justifyFull}
            onMouseDown={() => applyFormat("justifyFull")}
          >
            <FiAlignJustify size={15} />
          </ToolBtn>

          <Divider />

          <ToolBtn
            title="Bulleted list"
            active={activeFormats.insertUnorderedList}
            onMouseDown={() => applyFormat("insertUnorderedList")}
          >
            <FiList size={15} />
          </ToolBtn>
          <ToolBtn
            title="Numbered list"
            active={activeFormats.insertOrderedList}
            onMouseDown={() => applyFormat("insertOrderedList")}
          >
            <span className="text-xs font-semibold">1.</span>
          </ToolBtn>
          <ToolBtn title="Indent" onMouseDown={() => applyFormat("indent")}>
            <FiChevronsRight size={15} />
          </ToolBtn>
          <ToolBtn title="Outdent" onMouseDown={() => applyFormat("outdent")}>
            <FiChevronsLeft size={15} />
          </ToolBtn>

          <Divider />

          <ColorPickerBtn
            title="Text color"
            color={textColor}
            inputRef={textColorInputRef}
            onMouseDown={saveSelection}
            onPick={(val) => {
              setTextColor(val);
              applyFormat("foreColor", val);
            }}
          >
            <span className="font-bold text-[15px] leading-none">A</span>
          </ColorPickerBtn>

          <ColorPickerBtn
            title="Highlight color"
            color={highlightColor}
            inputRef={highlightColorInputRef}
            onMouseDown={saveSelection}
            onPick={(val) => {
              setHighlightColor(val);
              applyFormat("hiliteColor", val);
            }}
          >
            <span className="font-bold text-[15px] leading-none">H</span>
          </ColorPickerBtn>

          <Divider />

          <ToolBtn
            title="Insert image"
            onMouseDown={() => {
              saveSelection();
              fileInputRef.current.click();
            }}
            disabled={isPasteLoading}
          >
            <FiImage size={15} />
          </ToolBtn>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <ToolBtn
            title="Insert link"
            onMouseDown={() => {
              const url = prompt("Enter URL:");
              if (url) applyFormat("createLink", url);
            }}
          >
            <FiLink size={15} />
          </ToolBtn>
          <ToolBtn
            title="Remove link"
            onMouseDown={() => applyFormat("unlink")}
          >
            <FiLink2 size={15} />
          </ToolBtn>

          <Divider />

          <ToolBtn
            title="Clear formatting"
            onMouseDown={() => applyFormat("removeFormat")}
          >
            <FiSlash size={15} />
          </ToolBtn>

          <ToolBtn
            title="Clear / Deselect all active formats"
            active={anyFormatActive}
            onMouseDown={clearSelectionAndFormatting}
          >
            <FiX size={15} />
            <span className="text-xs ml-1">Clear</span>
          </ToolBtn>

          <Divider />

          <ToolBtn title="Undo" onMouseDown={undo} disabled={isPasteLoading}>
            <FiCornerUpLeft size={15} />
          </ToolBtn>
          <ToolBtn title="Redo" onMouseDown={redo} disabled={isPasteLoading}>
            <FiCornerUpRight size={15} />
          </ToolBtn>

          <Divider />

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
              createCustomTable();
            }}
            disabled={isPasteLoading}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-sm font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors disabled:opacity-50"
          >
            <FiGrid size={15} />
            Insert table
          </button>
        </div>

        {/* Contextual table toolbar */}
        <div
          className={`grid transition-all duration-200 ease-out ${
            insideTable
              ? "grid-rows-[1fr] opacity-100 mt-2"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="flex flex-wrap items-center gap-1 bg-indigo-50 border border-indigo-200 rounded-md px-2 py-1.5">
              <span className="text-xs font-medium text-indigo-700 pr-1 whitespace-nowrap">
                Table tools
              </span>
              <Divider />
              <ToolBtn
                title="Add row above"
                onMouseDown={() => addRow("before")}
              >
                <FiArrowUp size={14} />
                <FiPlus size={10} className="-ml-1" />
              </ToolBtn>
              <ToolBtn
                title="Add row below"
                onMouseDown={() => addRow("after")}
              >
                <FiArrowDown size={14} />
                <FiPlus size={10} className="-ml-1" />
              </ToolBtn>
              <ToolBtn title="Delete row" danger onMouseDown={deleteRow}>
                <FiX size={14} />
                <span className="text-xs ml-0.5">Row</span>
              </ToolBtn>
              <Divider />
              <ToolBtn
                title="Add column left"
                onMouseDown={() => addColumn("before")}
              >
                <FiArrowLeft size={14} />
                <FiPlus size={10} className="-ml-1" />
              </ToolBtn>
              <ToolBtn
                title="Add column right"
                onMouseDown={() => addColumn("after")}
              >
                <FiArrowRight size={14} />
                <FiPlus size={10} className="-ml-1" />
              </ToolBtn>
              <ToolBtn title="Delete column" danger onMouseDown={deleteColumn}>
                <FiX size={14} />
                <span className="text-xs ml-0.5">Col</span>
              </ToolBtn>
              <Divider />
              <ToolBtn title="Delete table" danger onMouseDown={deleteTable}>
                <FiTrash2 size={14} />
                <span className="text-xs ml-0.5">Table</span>
              </ToolBtn>
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-10">
            <div className="bg-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-500 border-t-transparent" />
              {isPasteLoading ? pasteStatusLabel : "Uploading image…"}
            </div>
          </div>
        )}

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className={`editor-content min-h-[480px] max-h-[70vh] overflow-y-auto p-5 mx-5 focus:outline-none ${
            isPasteLoading ? "opacity-70 pointer-events-none" : ""
          }`}
          onPaste={handlePaste}
          onInput={handleInput}
          onClick={handleEditorClick}
          onKeyUp={handleEditorKeyUp}
          onMouseUp={handleEditorClick}
          data-placeholder={placeholder}
          style={{
            fontFamily: "Arial, sans-serif",
            lineHeight: 1.6,
            fontSize: "14px",
          }}
        />
      </div>

      {/* Status bar */}
      <div className="border-t border-gray-200 px-4 py-2 bg-gray-50 text-xs text-gray-500 flex justify-between items-center min-h-[34px]">
        <span className={insideTable ? "text-indigo-700 font-medium" : ""}>
          {insideTable
            ? "● Editing inside a table — use Table tools above to add or remove rows/columns"
            : "Click 'Insert table' to add a table, or click into any cell to edit it"}
        </span>
        {toast && (
          <span className="text-red-600 font-medium animate-pulse">
            {toast}
          </span>
        )}
      </div>
    </div>
  );
};

export default CustomEditor;
