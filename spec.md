

# FFlat Specification 0.0.6

## PEG Grammar

```
bool <- (((AnyCase("true") !core.identifierNext) / (AnyCase("false") !core.identifierNext)) !identifierNext)
bracket <- advanceIf([[]{}()])
comment <- (fullComment / lineComment)
decimal <- ((plusOrMinus? (integer (fraction? (exponent? advanceIf([%])?)))) !advanceIf((![ \t\n\r\f,'\"`[]{}():] / core.atDigit)))
decimalFraction <- ((plusOrMinus? (integer? (fraction (exponent? advanceIf([%])?)))) !advanceIf((![ \t\n\r\f,'\"`[]{}():] / core.atDigit)))
delimiter <- advanceIf([ \t\n\r\f,])+
digit <- advanceIf((core.atDigit / [_]))
digits <- digit+
doubleQuotedString <- ("\"" ((advanceIf(![\"])* / <predicate>) ("\"" / <predicate>)))
escapedChar <- (advanceIf([\\]) core.advance)
exponent <- (advanceIf([eE]) (plusOrMinus? digits))
fraction <- ("." integer)
fullComment <- ("/*" (advanceIf(!"*/")* "*/"))
i <- ((AnyCase("i") !core.identifierNext) !identifierNext)
identifier <- (identifierFirst (identifierNext* advanceIf([:])?))
identifierFirst <- advanceIf(![ \t\n\r\f,'\"`[]{}()])
identifierNext <- advanceIf(![ \t\n\r\f,'\"`[]{}():])
integer <- (core.digit+ digit*)
lineComment <- ("//" untilEol)
literal <- (bool / (null / (nan / i)))
nan <- ((AnyCase("nan") !core.identifierNext) !identifierNext)
null <- ((AnyCase("null") !core.identifierNext) !identifierNext)
number <- (radix / (decimal / (decimalFraction / integer)))
plusOrMinus <- advanceIf([+-])
radix <- ((plusOrMinus? ("0" (advanceIf([oObBxF]) (radixInteger (radixFraction? radixExponent?))))) !advanceIf((![ \t\n\r\f,'\"`[]{}():] / ([0123456789abcdefABCDEF] / [_]))))
radixDigit <- advanceIf(([0123456789abcdefABCDEF] / [_]))
radixExponent <- (advanceIf([eEpP]) (plusOrMinus? radixDigit+))
radixFraction <- ("." radixInteger)
radixInteger <- (rawRadixDigit+ radixDigit*)
rawRadixDigit <- advanceIf([0123456789abcdefABCDEF])
sequence <- (value (ws value)*)?
singleQuotedString <- ("'" ((advanceIf(!['])* / <predicate>) ("'" / <predicate>)))
string <- (templateString / (singleQuotedString / doubleQuotedString))
symbol <- (advanceIf([#]) identifier)
templateString <- ("`" ((advanceIf(![`])* / <predicate>) ("`" / <predicate>)))
untilEol <- (advanceIf(!core.newLine)* core.newLine?)
value <- (comment / (number / (symbol / (literal / (word / (string / bracket))))))
word <- (identifierFirst (identifierNext* advanceIf([:])?))
ws <- (delimiter / advanceIf(core.atWs))*
```

## Syntax diagrams (WIP)

**bracket**

<svg class="railroad-diagram" width="185" height="62" viewBox="0 0 185 62">
<g transform="translate(.5 .5)">
<path d="M 20 21 v 20 m 10 -20 v 20 m -10 -10 h 20.5"></path>
<path d="M40 31h10"></path>
<g>
<path d="M50 31h0"></path>
<path d="M134 31h0"></path>
<rect x="50" y="20" width="84" height="22" rx="10" ry="10"></rect>
<text x="92" y="35">&#91;&#91;&#93;{}()&#93;</text>
</g>
<path d="M134 31h10"></path>
<path d="M 144 31 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
</g>
</svg>

**identifierFirst**

<svg class="railroad-diagram" width="357" height="90" viewBox="0 0 357 90">
<g transform="translate(.5 .5)">
<path d="M 20 20 v 20 m 10 -20 v 20 m -10 -10 h 20.5"></path>
<g>
<path d="M40 30h0"></path>
<path d="M316 30h0"></path>
<path d="M40 30h20"></path>
<g>
<path d="M60 30h236"></path>
</g>
<path d="M296 30h20"></path>
<path d="M40 30a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<g>
<path d="M60 50h0"></path>
<path d="M296 50h0"></path>
<path d="M 60 50 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
<path d="M80 50h10"></path>
<g>
<path d="M90 50h0"></path>
<path d="M286 50h0"></path>
<rect x="90" y="39" width="196" height="22" rx="10" ry="10"></rect>
<text x="188" y="54">&#91; \t\n\r\f,'\"&#96;&#91;&#93;{}()&#93;</text>
</g>
<path d="M286 50h10"></path>
</g>
<path d="M296 50a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
</g>
<path d="M 316 30 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
</g>
</svg>

**identifierNext**

<svg class="railroad-diagram" width="365" height="90" viewBox="0 0 365 90">
<g transform="translate(.5 .5)">
<path d="M 20 20 v 20 m 10 -20 v 20 m -10 -10 h 20.5"></path>
<g>
<path d="M40 30h0"></path>
<path d="M324 30h0"></path>
<path d="M40 30h20"></path>
<g>
<path d="M60 30h244"></path>
</g>
<path d="M304 30h20"></path>
<path d="M40 30a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<g>
<path d="M60 50h0"></path>
<path d="M304 50h0"></path>
<path d="M 60 50 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
<path d="M80 50h10"></path>
<g>
<path d="M90 50h0"></path>
<path d="M294 50h0"></path>
<rect x="90" y="39" width="204" height="22" rx="10" ry="10"></rect>
<text x="192" y="54">&#91; \t\n\r\f,'\"&#96;&#91;&#93;{}():&#93;</text>
</g>
<path d="M294 50h10"></path>
</g>
<path d="M304 50a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
</g>
<path d="M 324 30 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
</g>
</svg>

**identifier**

<svg class="railroad-diagram" width="517" height="81" viewBox="0 0 517 81">
<g transform="translate(.5 .5)">
<path d="M 20 31 v 20 m 10 -20 v 20 m -10 -10 h 20.5"></path>
<g>
<path d="M40 41h0"></path>
<path d="M476 41h0"></path>
<path d="M40 41h10"></path>
<g>
<path d="M50 41h0"></path>
<path d="M190 41h0"></path>
<rect x="50" y="30" width="140" height="22"></rect>
<text x="120" y="45">identifierFirst</text>
</g>
<path d="M190 41h10"></path>
<g>
<path d="M200 41h0"></path>
<path d="M476 41h0"></path>
<g>
<path d="M200 41h0"></path>
<path d="M392 41h0"></path>
<path d="M200 41a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
<g>
<path d="M220 21h152"></path>
</g>
<path d="M372 21a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<path d="M200 41h20"></path>
<g>
<path d="M220 41h0"></path>
<path d="M372 41h0"></path>
<path d="M220 41h10"></path>
<g>
<path d="M230 41h0"></path>
<path d="M362 41h0"></path>
<rect x="230" y="30" width="132" height="22"></rect>
<text x="296" y="45">identifierNext</text>
</g>
<path d="M362 41h10"></path>
<path d="M230 41a10 10 0 0 0 -10 10v0a10 10 0 0 0 10 10"></path>
<g>
<path d="M230 61h132"></path>
</g>
<path d="M362 61a10 10 0 0 0 10 -10v0a10 10 0 0 0 -10 -10"></path>
</g>
<path d="M372 41h20"></path>
</g>
<g>
<path d="M392 41h0"></path>
<path d="M476 41h0"></path>
<path d="M392 41a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
<g>
<path d="M412 21h44"></path>
</g>
<path d="M456 21a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<path d="M392 41h20"></path>
<g>
<path d="M412 41h0"></path>
<path d="M456 41h0"></path>
<rect x="412" y="30" width="44" height="22" rx="10" ry="10"></rect>
<text x="434" y="45">&#91;:&#93;</text>
</g>
<path d="M456 41h20"></path>
</g>
</g>
</g>
<path d="M 476 41 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
</g>
</svg>

**word**

<svg class="railroad-diagram" width="517" height="81" viewBox="0 0 517 81">
<g transform="translate(.5 .5)">
<path d="M 20 31 v 20 m 10 -20 v 20 m -10 -10 h 20.5"></path>
<g>
<path d="M40 41h0"></path>
<path d="M476 41h0"></path>
<path d="M40 41h10"></path>
<g>
<path d="M50 41h0"></path>
<path d="M190 41h0"></path>
<rect x="50" y="30" width="140" height="22"></rect>
<text x="120" y="45">identifierFirst</text>
</g>
<path d="M190 41h10"></path>
<g>
<path d="M200 41h0"></path>
<path d="M476 41h0"></path>
<g>
<path d="M200 41h0"></path>
<path d="M392 41h0"></path>
<path d="M200 41a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
<g>
<path d="M220 21h152"></path>
</g>
<path d="M372 21a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<path d="M200 41h20"></path>
<g>
<path d="M220 41h0"></path>
<path d="M372 41h0"></path>
<path d="M220 41h10"></path>
<g>
<path d="M230 41h0"></path>
<path d="M362 41h0"></path>
<rect x="230" y="30" width="132" height="22"></rect>
<text x="296" y="45">identifierNext</text>
</g>
<path d="M362 41h10"></path>
<path d="M230 41a10 10 0 0 0 -10 10v0a10 10 0 0 0 10 10"></path>
<g>
<path d="M230 61h132"></path>
</g>
<path d="M362 61a10 10 0 0 0 10 -10v0a10 10 0 0 0 -10 -10"></path>
</g>
<path d="M372 41h20"></path>
</g>
<g>
<path d="M392 41h0"></path>
<path d="M476 41h0"></path>
<path d="M392 41a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
<g>
<path d="M412 21h44"></path>
</g>
<path d="M456 21a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<path d="M392 41h20"></path>
<g>
<path d="M412 41h0"></path>
<path d="M456 41h0"></path>
<rect x="412" y="30" width="44" height="22" rx="10" ry="10"></rect>
<text x="434" y="45">&#91;:&#93;</text>
</g>
<path d="M456 41h20"></path>
</g>
</g>
</g>
<path d="M 476 41 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
</g>
</svg>

**digit**

<svg class="railroad-diagram" width="237" height="92" viewBox="0 0 237 92">
<g transform="translate(.5 .5)">
<path d="M 20 21 v 20 m 10 -20 v 20 m -10 -10 h 20.5"></path>
<g>
<path d="M40 31h0"></path>
<path d="M196 31h0"></path>
<path d="M40 31h20"></path>
<g>
<path d="M60 31h0"></path>
<path d="M176 31h0"></path>
<rect x="60" y="20" width="116" height="22" rx="10" ry="10"></rect>
<text x="118" y="35">core.atDigit</text>
</g>
<path d="M176 31h20"></path>
<path d="M40 31a10 10 0 0 1 10 10v10a10 10 0 0 0 10 10"></path>
<g>
<path d="M60 61h36"></path>
<path d="M140 61h36"></path>
<rect x="96" y="50" width="44" height="22" rx="10" ry="10"></rect>
<text x="118" y="65">&#91;&#95;&#93;</text>
</g>
<path d="M176 61a10 10 0 0 0 10 -10v-10a10 10 0 0 1 10 -10"></path>
</g>
<path d="M 196 31 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
</g>
</svg>

**digits**

<svg class="railroad-diagram" width="181" height="71" viewBox="0 0 181 71">
<g transform="translate(.5 .5)">
<path d="M 20 21 v 20 m 10 -20 v 20 m -10 -10 h 20.5"></path>
<path d="M40 31h10"></path>
<g>
<path d="M50 31h0"></path>
<path d="M130 31h0"></path>
<path d="M50 31h10"></path>
<g>
<path d="M60 31h0"></path>
<path d="M120 31h0"></path>
<rect x="60" y="20" width="60" height="22"></rect>
<text x="90" y="35">digit</text>
</g>
<path d="M120 31h10"></path>
<path d="M60 31a10 10 0 0 0 -10 10v0a10 10 0 0 0 10 10"></path>
<g>
<path d="M60 51h60"></path>
</g>
<path d="M120 51a10 10 0 0 0 10 -10v0a10 10 0 0 0 -10 -10"></path>
</g>
<path d="M130 31h10"></path>
<path d="M 140 31 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
</g>
</svg>

**integer**

<svg class="railroad-diagram" width="317" height="81" viewBox="0 0 317 81">
<g transform="translate(.5 .5)">
<path d="M 20 31 v 20 m 10 -20 v 20 m -10 -10 h 20.5"></path>
<g>
<path d="M40 41h0"></path>
<path d="M276 41h0"></path>
<path d="M40 41h10"></path>
<g>
<path d="M50 41h0"></path>
<path d="M146 41h0"></path>
<path d="M50 41h10"></path>
<g>
<path d="M60 41h0"></path>
<path d="M136 41h0"></path>
<rect x="60" y="30" width="76" height="22"></rect>
<text x="98" y="45">atDigit</text>
</g>
<path d="M136 41h10"></path>
<path d="M60 41a10 10 0 0 0 -10 10v0a10 10 0 0 0 10 10"></path>
<g>
<path d="M60 61h76"></path>
</g>
<path d="M136 61a10 10 0 0 0 10 -10v0a10 10 0 0 0 -10 -10"></path>
</g>
<path d="M146 41h10"></path>
<g>
<path d="M156 41h0"></path>
<path d="M276 41h0"></path>
<path d="M156 41a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
<g>
<path d="M176 21h80"></path>
</g>
<path d="M256 21a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<path d="M156 41h20"></path>
<g>
<path d="M176 41h0"></path>
<path d="M256 41h0"></path>
<path d="M176 41h10"></path>
<g>
<path d="M186 41h0"></path>
<path d="M246 41h0"></path>
<rect x="186" y="30" width="60" height="22"></rect>
<text x="216" y="45">digit</text>
</g>
<path d="M246 41h10"></path>
<path d="M186 41a10 10 0 0 0 -10 10v0a10 10 0 0 0 10 10"></path>
<g>
<path d="M186 61h60"></path>
</g>
<path d="M246 61a10 10 0 0 0 10 -10v0a10 10 0 0 0 -10 -10"></path>
</g>
<path d="M256 41h20"></path>
</g>
</g>
<path d="M 276 41 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
</g>
</svg>

**fraction**

<svg class="railroad-diagram" width="241" height="62" viewBox="0 0 241 62">
<g transform="translate(.5 .5)">
<path d="M 20 21 v 20 m 10 -20 v 20 m -10 -10 h 20.5"></path>
<g>
<path d="M40 31h0"></path>
<path d="M200 31h0"></path>
<path d="M40 31h10"></path>
<g>
<path d="M50 31h0"></path>
<path d="M94 31h0"></path>
<rect x="50" y="20" width="44" height="22" rx="10" ry="10"></rect>
<text x="72" y="35">"."</text>
</g>
<path d="M94 31h10"></path>
<path d="M104 31h10"></path>
<g>
<path d="M114 31h0"></path>
<path d="M190 31h0"></path>
<rect x="114" y="20" width="76" height="22"></rect>
<text x="152" y="35">integer</text>
</g>
<path d="M190 31h10"></path>
</g>
<path d="M 200 31 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
</g>
</svg>

**plusOrMinus**

<svg class="railroad-diagram" width="153" height="62" viewBox="0 0 153 62">
<g transform="translate(.5 .5)">
<path d="M 20 21 v 20 m 10 -20 v 20 m -10 -10 h 20.5"></path>
<path d="M40 31h10"></path>
<g>
<path d="M50 31h0"></path>
<path d="M102 31h0"></path>
<rect x="50" y="20" width="52" height="22" rx="10" ry="10"></rect>
<text x="76" y="35">&#91;+-&#93;</text>
</g>
<path d="M102 31h10"></path>
<path d="M 112 31 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
</g>
</svg>

**exponent**

<svg class="railroad-diagram" width="389" height="72" viewBox="0 0 389 72">
<g transform="translate(.5 .5)">
<path d="M 20 31 v 20 m 10 -20 v 20 m -10 -10 h 20.5"></path>
<g>
<path d="M40 41h0"></path>
<path d="M348 41h0"></path>
<path d="M40 41h10"></path>
<g>
<path d="M50 41h0"></path>
<path d="M102 41h0"></path>
<rect x="50" y="30" width="52" height="22" rx="10" ry="10"></rect>
<text x="76" y="45">&#91;eE&#93;</text>
</g>
<path d="M102 41h10"></path>
<g>
<path d="M112 41h0"></path>
<path d="M348 41h0"></path>
<g>
<path d="M112 41h0"></path>
<path d="M260 41h0"></path>
<path d="M112 41a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
<g>
<path d="M132 21h108"></path>
</g>
<path d="M240 21a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<path d="M112 41h20"></path>
<g>
<path d="M132 41h0"></path>
<path d="M240 41h0"></path>
<rect x="132" y="30" width="108" height="22"></rect>
<text x="186" y="45">plusOrMinus</text>
</g>
<path d="M240 41h20"></path>
</g>
<path d="M260 41h10"></path>
<g>
<path d="M270 41h0"></path>
<path d="M338 41h0"></path>
<rect x="270" y="30" width="68" height="22"></rect>
<text x="304" y="45">digits</text>
</g>
<path d="M338 41h10"></path>
</g>
</g>
<path d="M 348 41 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
</g>
</svg>

**decimal**

<svg class="railroad-diagram" width="1041" height="159" viewBox="0 0 1041 159">
<g transform="translate(.5 .5)">
<path d="M 20 31 v 20 m 10 -20 v 20 m -10 -10 h 20.5"></path>
<g>
<path d="M40 41h0"></path>
<path d="M1000 41h0"></path>
<g>
<path d="M40 41h0"></path>
<path d="M616 41h0"></path>
<g>
<path d="M40 41h0"></path>
<path d="M188 41h0"></path>
<path d="M40 41a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
<g>
<path d="M60 21h108"></path>
</g>
<path d="M168 21a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<path d="M40 41h20"></path>
<g>
<path d="M60 41h0"></path>
<path d="M168 41h0"></path>
<rect x="60" y="30" width="108" height="22"></rect>
<text x="114" y="45">plusOrMinus</text>
</g>
<path d="M168 41h20"></path>
</g>
<g>
<path d="M188 41h0"></path>
<path d="M616 41h0"></path>
<path d="M188 41h10"></path>
<g>
<path d="M198 41h0"></path>
<path d="M274 41h0"></path>
<rect x="198" y="30" width="76" height="22"></rect>
<text x="236" y="45">integer</text>
</g>
<path d="M274 41h10"></path>
<g>
<path d="M284 41h0"></path>
<path d="M616 41h0"></path>
<g>
<path d="M284 41h0"></path>
<path d="M408 41h0"></path>
<path d="M284 41a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
<g>
<path d="M304 21h84"></path>
</g>
<path d="M388 21a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<path d="M284 41h20"></path>
<g>
<path d="M304 41h0"></path>
<path d="M388 41h0"></path>
<rect x="304" y="30" width="84" height="22"></rect>
<text x="346" y="45">fraction</text>
</g>
<path d="M388 41h20"></path>
</g>
<g>
<path d="M408 41h0"></path>
<path d="M616 41h0"></path>
<g>
<path d="M408 41h0"></path>
<path d="M532 41h0"></path>
<path d="M408 41a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
<g>
<path d="M428 21h84"></path>
</g>
<path d="M512 21a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<path d="M408 41h20"></path>
<g>
<path d="M428 41h0"></path>
<path d="M512 41h0"></path>
<rect x="428" y="30" width="84" height="22"></rect>
<text x="470" y="45">exponent</text>
</g>
<path d="M512 41h20"></path>
</g>
<g>
<path d="M532 41h0"></path>
<path d="M616 41h0"></path>
<path d="M532 41a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
<g>
<path d="M552 21h44"></path>
</g>
<path d="M596 21a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<path d="M532 41h20"></path>
<g>
<path d="M552 41h0"></path>
<path d="M596 41h0"></path>
<rect x="552" y="30" width="44" height="22" rx="10" ry="10"></rect>
<text x="574" y="45">&#91;%&#93;</text>
</g>
<path d="M596 41h20"></path>
</g>
</g>
</g>
</g>
</g>
<g>
<path d="M616 41h0"></path>
<path d="M1000 41h0"></path>
<path d="M616 41h20"></path>
<g>
<path d="M636 41h344"></path>
</g>
<path d="M980 41h20"></path>
<path d="M616 41a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<g>
<path d="M636 61h0"></path>
<path d="M980 61h0"></path>
<path d="M 636 61 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
<g>
<path d="M656 61h0"></path>
<path d="M980 61h0"></path>
<path d="M656 61h20"></path>
<g>
<path d="M676 61h0"></path>
<path d="M960 61h0"></path>
<path d="M676 61h20"></path>
<g>
<path d="M696 61h244"></path>
</g>
<path d="M940 61h20"></path>
<path d="M676 61a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<g>
<path d="M696 81h0"></path>
<path d="M940 81h0"></path>
<path d="M 696 81 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
<path d="M716 81h10"></path>
<g>
<path d="M726 81h0"></path>
<path d="M930 81h0"></path>
<rect x="726" y="70" width="204" height="22" rx="10" ry="10"></rect>
<text x="828" y="85">&#91; \t\n\r\f,'\"&#96;&#91;&#93;{}():&#93;</text>
</g>
<path d="M930 81h10"></path>
</g>
<path d="M940 81a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
</g>
<path d="M960 61h20"></path>
<path d="M656 61a10 10 0 0 1 10 10v39a10 10 0 0 0 10 10"></path>
<g>
<path d="M676 120h104"></path>
<path d="M856 120h104"></path>
<rect x="780" y="109" width="76" height="22"></rect>
<text x="818" y="124">atDigit</text>
</g>
<path d="M960 120a10 10 0 0 0 10 -10v-39a10 10 0 0 1 10 -10"></path>
</g>
</g>
<path d="M980 61a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
</g>
</g>
<path d="M 1000 41 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
</g>
</svg>

**decimalFraction**

<svg class="railroad-diagram" width="1041" height="159" viewBox="0 0 1041 159">
<g transform="translate(.5 .5)">
<path d="M 20 31 v 20 m 10 -20 v 20 m -10 -10 h 20.5"></path>
<g>
<path d="M40 41h0"></path>
<path d="M1000 41h0"></path>
<g>
<path d="M40 41h0"></path>
<path d="M616 41h0"></path>
<g>
<path d="M40 41h0"></path>
<path d="M188 41h0"></path>
<path d="M40 41a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
<g>
<path d="M60 21h108"></path>
</g>
<path d="M168 21a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<path d="M40 41h20"></path>
<g>
<path d="M60 41h0"></path>
<path d="M168 41h0"></path>
<rect x="60" y="30" width="108" height="22"></rect>
<text x="114" y="45">plusOrMinus</text>
</g>
<path d="M168 41h20"></path>
</g>
<g>
<path d="M188 41h0"></path>
<path d="M616 41h0"></path>
<g>
<path d="M188 41h0"></path>
<path d="M304 41h0"></path>
<path d="M188 41a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
<g>
<path d="M208 21h76"></path>
</g>
<path d="M284 21a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<path d="M188 41h20"></path>
<g>
<path d="M208 41h0"></path>
<path d="M284 41h0"></path>
<rect x="208" y="30" width="76" height="22"></rect>
<text x="246" y="45">integer</text>
</g>
<path d="M284 41h20"></path>
</g>
<g>
<path d="M304 41h0"></path>
<path d="M616 41h0"></path>
<path d="M304 41h10"></path>
<g>
<path d="M314 41h0"></path>
<path d="M398 41h0"></path>
<rect x="314" y="30" width="84" height="22"></rect>
<text x="356" y="45">fraction</text>
</g>
<path d="M398 41h10"></path>
<g>
<path d="M408 41h0"></path>
<path d="M616 41h0"></path>
<g>
<path d="M408 41h0"></path>
<path d="M532 41h0"></path>
<path d="M408 41a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
<g>
<path d="M428 21h84"></path>
</g>
<path d="M512 21a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<path d="M408 41h20"></path>
<g>
<path d="M428 41h0"></path>
<path d="M512 41h0"></path>
<rect x="428" y="30" width="84" height="22"></rect>
<text x="470" y="45">exponent</text>
</g>
<path d="M512 41h20"></path>
</g>
<g>
<path d="M532 41h0"></path>
<path d="M616 41h0"></path>
<path d="M532 41a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
<g>
<path d="M552 21h44"></path>
</g>
<path d="M596 21a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<path d="M532 41h20"></path>
<g>
<path d="M552 41h0"></path>
<path d="M596 41h0"></path>
<rect x="552" y="30" width="44" height="22" rx="10" ry="10"></rect>
<text x="574" y="45">&#91;%&#93;</text>
</g>
<path d="M596 41h20"></path>
</g>
</g>
</g>
</g>
</g>
<g>
<path d="M616 41h0"></path>
<path d="M1000 41h0"></path>
<path d="M616 41h20"></path>
<g>
<path d="M636 41h344"></path>
</g>
<path d="M980 41h20"></path>
<path d="M616 41a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<g>
<path d="M636 61h0"></path>
<path d="M980 61h0"></path>
<path d="M 636 61 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
<g>
<path d="M656 61h0"></path>
<path d="M980 61h0"></path>
<path d="M656 61h20"></path>
<g>
<path d="M676 61h0"></path>
<path d="M960 61h0"></path>
<path d="M676 61h20"></path>
<g>
<path d="M696 61h244"></path>
</g>
<path d="M940 61h20"></path>
<path d="M676 61a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<g>
<path d="M696 81h0"></path>
<path d="M940 81h0"></path>
<path d="M 696 81 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
<path d="M716 81h10"></path>
<g>
<path d="M726 81h0"></path>
<path d="M930 81h0"></path>
<rect x="726" y="70" width="204" height="22" rx="10" ry="10"></rect>
<text x="828" y="85">&#91; \t\n\r\f,'\"&#96;&#91;&#93;{}():&#93;</text>
</g>
<path d="M930 81h10"></path>
</g>
<path d="M940 81a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
</g>
<path d="M960 61h20"></path>
<path d="M656 61a10 10 0 0 1 10 10v39a10 10 0 0 0 10 10"></path>
<g>
<path d="M676 120h104"></path>
<path d="M856 120h104"></path>
<rect x="780" y="109" width="76" height="22"></rect>
<text x="818" y="124">atDigit</text>
</g>
<path d="M960 120a10 10 0 0 0 10 -10v-39a10 10 0 0 1 10 -10"></path>
</g>
</g>
<path d="M980 61a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
</g>
</g>
<path d="M 1000 41 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
</g>
</svg>

**rawRadixDigit**

<svg class="railroad-diagram" width="313" height="62" viewBox="0 0 313 62">
<g transform="translate(.5 .5)">
<path d="M 20 21 v 20 m 10 -20 v 20 m -10 -10 h 20.5"></path>
<path d="M40 31h10"></path>
<g>
<path d="M50 31h0"></path>
<path d="M262 31h0"></path>
<rect x="50" y="20" width="212" height="22" rx="10" ry="10"></rect>
<text x="156" y="35">&#91;0123456789abcdefABCDEF&#93;</text>
</g>
<path d="M262 31h10"></path>
<path d="M 272 31 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
</g>
</svg>

**radixDigit**

<svg class="railroad-diagram" width="333" height="92" viewBox="0 0 333 92">
<g transform="translate(.5 .5)">
<path d="M 20 21 v 20 m 10 -20 v 20 m -10 -10 h 20.5"></path>
<g>
<path d="M40 31h0"></path>
<path d="M292 31h0"></path>
<path d="M40 31h20"></path>
<g>
<path d="M60 31h0"></path>
<path d="M272 31h0"></path>
<rect x="60" y="20" width="212" height="22" rx="10" ry="10"></rect>
<text x="166" y="35">&#91;0123456789abcdefABCDEF&#93;</text>
</g>
<path d="M272 31h20"></path>
<path d="M40 31a10 10 0 0 1 10 10v10a10 10 0 0 0 10 10"></path>
<g>
<path d="M60 61h84"></path>
<path d="M188 61h84"></path>
<rect x="144" y="50" width="44" height="22" rx="10" ry="10"></rect>
<text x="166" y="65">&#91;&#95;&#93;</text>
</g>
<path d="M272 61a10 10 0 0 0 10 -10v-10a10 10 0 0 1 10 -10"></path>
</g>
<path d="M 292 31 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
</g>
</svg>

**radixInteger**

<svg class="railroad-diagram" width="405" height="81" viewBox="0 0 405 81">
<g transform="translate(.5 .5)">
<path d="M 20 31 v 20 m 10 -20 v 20 m -10 -10 h 20.5"></path>
<g>
<path d="M40 41h0"></path>
<path d="M364 41h0"></path>
<path d="M40 41h10"></path>
<g>
<path d="M50 41h0"></path>
<path d="M194 41h0"></path>
<path d="M50 41h10"></path>
<g>
<path d="M60 41h0"></path>
<path d="M184 41h0"></path>
<rect x="60" y="30" width="124" height="22"></rect>
<text x="122" y="45">rawRadixDigit</text>
</g>
<path d="M184 41h10"></path>
<path d="M60 41a10 10 0 0 0 -10 10v0a10 10 0 0 0 10 10"></path>
<g>
<path d="M60 61h124"></path>
</g>
<path d="M184 61a10 10 0 0 0 10 -10v0a10 10 0 0 0 -10 -10"></path>
</g>
<path d="M194 41h10"></path>
<g>
<path d="M204 41h0"></path>
<path d="M364 41h0"></path>
<path d="M204 41a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
<g>
<path d="M224 21h120"></path>
</g>
<path d="M344 21a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<path d="M204 41h20"></path>
<g>
<path d="M224 41h0"></path>
<path d="M344 41h0"></path>
<path d="M224 41h10"></path>
<g>
<path d="M234 41h0"></path>
<path d="M334 41h0"></path>
<rect x="234" y="30" width="100" height="22"></rect>
<text x="284" y="45">radixDigit</text>
</g>
<path d="M334 41h10"></path>
<path d="M234 41a10 10 0 0 0 -10 10v0a10 10 0 0 0 10 10"></path>
<g>
<path d="M234 61h100"></path>
</g>
<path d="M334 61a10 10 0 0 0 10 -10v0a10 10 0 0 0 -10 -10"></path>
</g>
<path d="M344 41h20"></path>
</g>
</g>
<path d="M 364 41 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
</g>
</svg>

**radixFraction**

<svg class="railroad-diagram" width="281" height="62" viewBox="0 0 281 62">
<g transform="translate(.5 .5)">
<path d="M 20 21 v 20 m 10 -20 v 20 m -10 -10 h 20.5"></path>
<g>
<path d="M40 31h0"></path>
<path d="M240 31h0"></path>
<path d="M40 31h10"></path>
<g>
<path d="M50 31h0"></path>
<path d="M94 31h0"></path>
<rect x="50" y="20" width="44" height="22" rx="10" ry="10"></rect>
<text x="72" y="35">"."</text>
</g>
<path d="M94 31h10"></path>
<path d="M104 31h10"></path>
<g>
<path d="M114 31h0"></path>
<path d="M230 31h0"></path>
<rect x="114" y="20" width="116" height="22"></rect>
<text x="172" y="35">radixInteger</text>
</g>
<path d="M230 31h10"></path>
</g>
<path d="M 240 31 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
</g>
</svg>

**radixExponent**

<svg class="railroad-diagram" width="457" height="81" viewBox="0 0 457 81">
<g transform="translate(.5 .5)">
<path d="M 20 31 v 20 m 10 -20 v 20 m -10 -10 h 20.5"></path>
<g>
<path d="M40 41h0"></path>
<path d="M416 41h0"></path>
<path d="M40 41h10"></path>
<g>
<path d="M50 41h0"></path>
<path d="M118 41h0"></path>
<rect x="50" y="30" width="68" height="22" rx="10" ry="10"></rect>
<text x="84" y="45">&#91;eEpP&#93;</text>
</g>
<path d="M118 41h10"></path>
<g>
<path d="M128 41h0"></path>
<path d="M416 41h0"></path>
<g>
<path d="M128 41h0"></path>
<path d="M276 41h0"></path>
<path d="M128 41a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
<g>
<path d="M148 21h108"></path>
</g>
<path d="M256 21a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<path d="M128 41h20"></path>
<g>
<path d="M148 41h0"></path>
<path d="M256 41h0"></path>
<rect x="148" y="30" width="108" height="22"></rect>
<text x="202" y="45">plusOrMinus</text>
</g>
<path d="M256 41h20"></path>
</g>
<path d="M276 41h10"></path>
<g>
<path d="M286 41h0"></path>
<path d="M406 41h0"></path>
<path d="M286 41h10"></path>
<g>
<path d="M296 41h0"></path>
<path d="M396 41h0"></path>
<rect x="296" y="30" width="100" height="22"></rect>
<text x="346" y="45">radixDigit</text>
</g>
<path d="M396 41h10"></path>
<path d="M296 41a10 10 0 0 0 -10 10v0a10 10 0 0 0 10 10"></path>
<g>
<path d="M296 61h100"></path>
</g>
<path d="M396 61a10 10 0 0 0 10 -10v0a10 10 0 0 0 -10 -10"></path>
</g>
<path d="M406 41h10"></path>
</g>
</g>
<path d="M 416 41 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
</g>
</svg>

**radix**

<svg class="railroad-diagram" width="1245" height="189" viewBox="0 0 1245 189">
<g transform="translate(.5 .5)">
<path d="M 20 31 v 20 m 10 -20 v 20 m -10 -10 h 20.5"></path>
<g>
<path d="M40 41h0"></path>
<path d="M1204 41h0"></path>
<g>
<path d="M40 41h0"></path>
<path d="M820 41h0"></path>
<g>
<path d="M40 41h0"></path>
<path d="M188 41h0"></path>
<path d="M40 41a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
<g>
<path d="M60 21h108"></path>
</g>
<path d="M168 21a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<path d="M40 41h20"></path>
<g>
<path d="M60 41h0"></path>
<path d="M168 41h0"></path>
<rect x="60" y="30" width="108" height="22"></rect>
<text x="114" y="45">plusOrMinus</text>
</g>
<path d="M168 41h20"></path>
</g>
<g>
<path d="M188 41h0"></path>
<path d="M820 41h0"></path>
<path d="M188 41h10"></path>
<g>
<path d="M198 41h0"></path>
<path d="M242 41h0"></path>
<rect x="198" y="30" width="44" height="22" rx="10" ry="10"></rect>
<text x="220" y="45">"0"</text>
</g>
<path d="M242 41h10"></path>
<g>
<path d="M252 41h0"></path>
<path d="M820 41h0"></path>
<path d="M252 41h10"></path>
<g>
<path d="M262 41h0"></path>
<path d="M346 41h0"></path>
<rect x="262" y="30" width="84" height="22" rx="10" ry="10"></rect>
<text x="304" y="45">&#91;oObBxF&#93;</text>
</g>
<path d="M346 41h10"></path>
<g>
<path d="M356 41h0"></path>
<path d="M820 41h0"></path>
<path d="M356 41h10"></path>
<g>
<path d="M366 41h0"></path>
<path d="M482 41h0"></path>
<rect x="366" y="30" width="116" height="22"></rect>
<text x="424" y="45">radixInteger</text>
</g>
<path d="M482 41h10"></path>
<g>
<path d="M492 41h0"></path>
<path d="M820 41h0"></path>
<g>
<path d="M492 41h0"></path>
<path d="M656 41h0"></path>
<path d="M492 41a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
<g>
<path d="M512 21h124"></path>
</g>
<path d="M636 21a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<path d="M492 41h20"></path>
<g>
<path d="M512 41h0"></path>
<path d="M636 41h0"></path>
<rect x="512" y="30" width="124" height="22"></rect>
<text x="574" y="45">radixFraction</text>
</g>
<path d="M636 41h20"></path>
</g>
<g>
<path d="M656 41h0"></path>
<path d="M820 41h0"></path>
<path d="M656 41a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
<g>
<path d="M676 21h124"></path>
</g>
<path d="M800 21a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<path d="M656 41h20"></path>
<g>
<path d="M676 41h0"></path>
<path d="M800 41h0"></path>
<rect x="676" y="30" width="124" height="22"></rect>
<text x="738" y="45">radixExponent</text>
</g>
<path d="M800 41h20"></path>
</g>
</g>
</g>
</g>
</g>
</g>
<g>
<path d="M820 41h0"></path>
<path d="M1204 41h0"></path>
<path d="M820 41h20"></path>
<g>
<path d="M840 41h344"></path>
</g>
<path d="M1184 41h20"></path>
<path d="M820 41a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<g>
<path d="M840 61h0"></path>
<path d="M1184 61h0"></path>
<path d="M 840 61 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
<g>
<path d="M860 61h0"></path>
<path d="M1184 61h0"></path>
<path d="M860 61h20"></path>
<g>
<path d="M880 61h0"></path>
<path d="M1164 61h0"></path>
<path d="M880 61h20"></path>
<g>
<path d="M900 61h244"></path>
</g>
<path d="M1144 61h20"></path>
<path d="M880 61a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<g>
<path d="M900 81h0"></path>
<path d="M1144 81h0"></path>
<path d="M 900 81 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
<path d="M920 81h10"></path>
<g>
<path d="M930 81h0"></path>
<path d="M1134 81h0"></path>
<rect x="930" y="70" width="204" height="22" rx="10" ry="10"></rect>
<text x="1032" y="85">&#91; \t\n\r\f,'\"&#96;&#91;&#93;{}():&#93;</text>
</g>
<path d="M1134 81h10"></path>
</g>
<path d="M1144 81a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
</g>
<path d="M1164 61h20"></path>
<path d="M860 61a10 10 0 0 1 10 10v39a10 10 0 0 0 10 10"></path>
<g>
<path d="M880 120h16"></path>
<path d="M1148 120h16"></path>
<path d="M896 120h20"></path>
<g>
<path d="M916 120h0"></path>
<path d="M1128 120h0"></path>
<rect x="916" y="109" width="212" height="22" rx="10" ry="10"></rect>
<text x="1022" y="124">&#91;0123456789abcdefABCDEF&#93;</text>
</g>
<path d="M1128 120h20"></path>
<path d="M896 120a10 10 0 0 1 10 10v10a10 10 0 0 0 10 10"></path>
<g>
<path d="M916 150h84"></path>
<path d="M1044 150h84"></path>
<rect x="1000" y="139" width="44" height="22" rx="10" ry="10"></rect>
<text x="1022" y="154">&#91;&#95;&#93;</text>
</g>
<path d="M1128 150a10 10 0 0 0 10 -10v-10a10 10 0 0 1 10 -10"></path>
</g>
<path d="M1164 120a10 10 0 0 0 10 -10v-39a10 10 0 0 1 10 -10"></path>
</g>
</g>
<path d="M1184 61a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
</g>
</g>
<path d="M 1204 41 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
</g>
</svg>

**number**

<svg class="railroad-diagram" width="341" height="152" viewBox="0 0 341 152">
<g transform="translate(.5 .5)">
<path d="M 20 21 v 20 m 10 -20 v 20 m -10 -10 h 20.5"></path>
<g>
<path d="M40 31h0"></path>
<path d="M300 31h0"></path>
<path d="M40 31h20"></path>
<g>
<path d="M60 31h80"></path>
<path d="M200 31h80"></path>
<rect x="140" y="20" width="60" height="22"></rect>
<text x="170" y="35">radix</text>
</g>
<path d="M280 31h20"></path>
<path d="M40 31a10 10 0 0 1 10 10v10a10 10 0 0 0 10 10"></path>
<g>
<path d="M60 61h0"></path>
<path d="M280 61h0"></path>
<path d="M60 61h20"></path>
<g>
<path d="M80 61h52"></path>
<path d="M208 61h52"></path>
<rect x="132" y="50" width="76" height="22"></rect>
<text x="170" y="65">decimal</text>
</g>
<path d="M260 61h20"></path>
<path d="M60 61a10 10 0 0 1 10 10v10a10 10 0 0 0 10 10"></path>
<g>
<path d="M80 91h0"></path>
<path d="M260 91h0"></path>
<path d="M80 91h20"></path>
<g>
<path d="M100 91h0"></path>
<path d="M240 91h0"></path>
<rect x="100" y="80" width="140" height="22"></rect>
<text x="170" y="95">decimalFraction</text>
</g>
<path d="M240 91h20"></path>
<path d="M80 91a10 10 0 0 1 10 10v10a10 10 0 0 0 10 10"></path>
<g>
<path d="M100 121h32"></path>
<path d="M208 121h32"></path>
<rect x="132" y="110" width="76" height="22"></rect>
<text x="170" y="125">integer</text>
</g>
<path d="M240 121a10 10 0 0 0 10 -10v-10a10 10 0 0 1 10 -10"></path>
</g>
<path d="M260 91a10 10 0 0 0 10 -10v-10a10 10 0 0 1 10 -10"></path>
</g>
<path d="M280 61a10 10 0 0 0 10 -10v-10a10 10 0 0 1 10 -10"></path>
</g>
<path d="M 300 31 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
</g>
</svg>

**untilEol**

<svg class="railroad-diagram" width="549" height="131" viewBox="0 0 549 131">
<g transform="translate(.5 .5)">
<path d="M 20 31 v 20 m 10 -20 v 20 m -10 -10 h 20.5"></path>
<g>
<path d="M40 41h0"></path>
<path d="M508 41h0"></path>
<g>
<path d="M40 41h0"></path>
<path d="M392 41h0"></path>
<g>
<path d="M40 41h0"></path>
<path d="M232 41h0"></path>
<path d="M40 41h20"></path>
<g>
<path d="M60 41h152"></path>
</g>
<path d="M212 41h20"></path>
<path d="M40 41a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<g>
<path d="M60 61h0"></path>
<path d="M212 61h0"></path>
<path d="M 60 61 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
<g>
<path d="M80 61h0"></path>
<path d="M212 61h0"></path>
<path d="M80 61h20"></path>
<g>
<path d="M100 61h0"></path>
<path d="M192 61h0"></path>
<rect x="100" y="50" width="92" height="22" rx="10" ry="10"></rect>
<text x="146" y="65">core.crlf</text>
</g>
<path d="M192 61h20"></path>
<path d="M80 61a10 10 0 0 1 10 10v10a10 10 0 0 0 10 10"></path>
<g>
<path d="M100 91h20"></path>
<path d="M172 91h20"></path>
<rect x="120" y="80" width="52" height="22" rx="10" ry="10"></rect>
<text x="146" y="95">"\n"</text>
</g>
<path d="M192 91a10 10 0 0 0 10 -10v-10a10 10 0 0 1 10 -10"></path>
</g>
</g>
<path d="M212 61a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
</g>
<path d="M232 41h10"></path>
<g>
<path d="M242 41h0"></path>
<path d="M382 41h0"></path>
<rect x="242" y="30" width="140" height="22" rx="10" ry="10"></rect>
<text x="312" y="45">&#91;any character&#93;</text>
</g>
<path d="M382 41h10"></path>
</g>
<g>
<path d="M392 41h0"></path>
<path d="M508 41h0"></path>
<path d="M392 41a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
<g>
<path d="M412 21h76"></path>
</g>
<path d="M488 21a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<path d="M392 41h20"></path>
<g>
<path d="M412 41h0"></path>
<path d="M488 41h0"></path>
<rect x="412" y="30" width="76" height="22"></rect>
<text x="450" y="45">newLine</text>
</g>
<path d="M488 41h20"></path>
</g>
</g>
<path d="M 508 41 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
</g>
</svg>

**fullComment**

<svg class="railroad-diagram" width="517" height="91" viewBox="0 0 517 91">
<g transform="translate(.5 .5)">
<path d="M 20 21 v 20 m 10 -20 v 20 m -10 -10 h 20.5"></path>
<g>
<path d="M40 31h0"></path>
<path d="M476 31h0"></path>
<path d="M40 31h10"></path>
<g>
<path d="M50 31h0"></path>
<path d="M102 31h0"></path>
<rect x="50" y="20" width="52" height="22" rx="10" ry="10"></rect>
<text x="76" y="35">"/&#42;"</text>
</g>
<path d="M102 31h10"></path>
<g>
<path d="M112 31h0"></path>
<path d="M476 31h0"></path>
<g>
<path d="M112 31h0"></path>
<path d="M404 31h0"></path>
<g>
<path d="M112 31h0"></path>
<path d="M244 31h0"></path>
<path d="M112 31h20"></path>
<g>
<path d="M132 31h92"></path>
</g>
<path d="M224 31h20"></path>
<path d="M112 31a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<g>
<path d="M132 51h0"></path>
<path d="M224 51h0"></path>
<path d="M 132 51 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
<path d="M152 51h10"></path>
<g>
<path d="M162 51h0"></path>
<path d="M214 51h0"></path>
<rect x="162" y="40" width="52" height="22" rx="10" ry="10"></rect>
<text x="188" y="55">"&#42;/"</text>
</g>
<path d="M214 51h10"></path>
</g>
<path d="M224 51a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
</g>
<path d="M244 31h10"></path>
<g>
<path d="M254 31h0"></path>
<path d="M394 31h0"></path>
<rect x="254" y="20" width="140" height="22" rx="10" ry="10"></rect>
<text x="324" y="35">&#91;any character&#93;</text>
</g>
<path d="M394 31h10"></path>
</g>
<path d="M404 31h10"></path>
<g>
<path d="M414 31h0"></path>
<path d="M466 31h0"></path>
<rect x="414" y="20" width="52" height="22" rx="10" ry="10"></rect>
<text x="440" y="35">"&#42;/"</text>
</g>
<path d="M466 31h10"></path>
</g>
</g>
<path d="M 476 31 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
</g>
</svg>

**lineComment**

<svg class="railroad-diagram" width="257" height="62" viewBox="0 0 257 62">
<g transform="translate(.5 .5)">
<path d="M 20 21 v 20 m 10 -20 v 20 m -10 -10 h 20.5"></path>
<g>
<path d="M40 31h0"></path>
<path d="M216 31h0"></path>
<path d="M40 31h10"></path>
<g>
<path d="M50 31h0"></path>
<path d="M102 31h0"></path>
<rect x="50" y="20" width="52" height="22" rx="10" ry="10"></rect>
<text x="76" y="35">"//"</text>
</g>
<path d="M102 31h10"></path>
<path d="M112 31h10"></path>
<g>
<path d="M122 31h0"></path>
<path d="M206 31h0"></path>
<rect x="122" y="20" width="84" height="22"></rect>
<text x="164" y="35">untilEol</text>
</g>
<path d="M206 31h10"></path>
</g>
<path d="M 216 31 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
</g>
</svg>

**comment**

<svg class="railroad-diagram" width="229" height="92" viewBox="0 0 229 92">
<g transform="translate(.5 .5)">
<path d="M 20 21 v 20 m 10 -20 v 20 m -10 -10 h 20.5"></path>
<g>
<path d="M40 31h0"></path>
<path d="M188 31h0"></path>
<path d="M40 31h20"></path>
<g>
<path d="M60 31h0"></path>
<path d="M168 31h0"></path>
<rect x="60" y="20" width="108" height="22"></rect>
<text x="114" y="35">fullComment</text>
</g>
<path d="M168 31h20"></path>
<path d="M40 31a10 10 0 0 1 10 10v10a10 10 0 0 0 10 10"></path>
<g>
<path d="M60 61h0"></path>
<path d="M168 61h0"></path>
<rect x="60" y="50" width="108" height="22"></rect>
<text x="114" y="65">lineComment</text>
</g>
<path d="M168 61a10 10 0 0 0 10 -10v-10a10 10 0 0 1 10 -10"></path>
</g>
<path d="M 188 31 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
</g>
</svg>

**delimiter**

<svg class="railroad-diagram" width="237" height="71" viewBox="0 0 237 71">
<g transform="translate(.5 .5)">
<path d="M 20 21 v 20 m 10 -20 v 20 m -10 -10 h 20.5"></path>
<path d="M40 31h10"></path>
<g>
<path d="M50 31h0"></path>
<path d="M186 31h0"></path>
<path d="M50 31h10"></path>
<g>
<path d="M60 31h0"></path>
<path d="M176 31h0"></path>
<rect x="60" y="20" width="116" height="22" rx="10" ry="10"></rect>
<text x="118" y="35">&#91; \t\n\r\f,&#93;</text>
</g>
<path d="M176 31h10"></path>
<path d="M60 31a10 10 0 0 0 -10 10v0a10 10 0 0 0 10 10"></path>
<g>
<path d="M60 51h116"></path>
</g>
<path d="M176 51a10 10 0 0 0 10 -10v0a10 10 0 0 0 -10 -10"></path>
</g>
<path d="M186 31h10"></path>
<path d="M 196 31 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
</g>
</svg>

**ws**

<svg class="railroad-diagram" width="273" height="110" viewBox="0 0 273 110">
<g transform="translate(.5 .5)">
<path d="M 20 31 v 20 m 10 -20 v 20 m -10 -10 h 20.5"></path>
<g>
<path d="M40 41h0"></path>
<path d="M232 41h0"></path>
<path d="M40 41a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
<g>
<path d="M60 21h152"></path>
</g>
<path d="M212 21a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<path d="M40 41h20"></path>
<g>
<path d="M60 41h0"></path>
<path d="M212 41h0"></path>
<path d="M60 41h10"></path>
<g>
<path d="M70 41h0"></path>
<path d="M202 41h0"></path>
<path d="M70 41h20"></path>
<g>
<path d="M90 41h0"></path>
<path d="M182 41h0"></path>
<rect x="90" y="30" width="92" height="22"></rect>
<text x="136" y="45">delimiter</text>
</g>
<path d="M182 41h20"></path>
<path d="M70 41a10 10 0 0 1 10 10v10a10 10 0 0 0 10 10"></path>
<g>
<path d="M90 71h0"></path>
<path d="M182 71h0"></path>
<rect x="90" y="60" width="92" height="22" rx="10" ry="10"></rect>
<text x="136" y="75">core.atWs</text>
</g>
<path d="M182 71a10 10 0 0 0 10 -10v-10a10 10 0 0 1 10 -10"></path>
</g>
<path d="M202 41h10"></path>
<path d="M70 41a10 10 0 0 0 -10 10v29a10 10 0 0 0 10 10"></path>
<g>
<path d="M70 90h132"></path>
</g>
<path d="M202 90a10 10 0 0 0 10 -10v-29a10 10 0 0 0 -10 -10"></path>
</g>
<path d="M212 41h20"></path>
</g>
<path d="M 232 41 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
</g>
</svg>

**symbol**

<svg class="railroad-diagram" width="265" height="62" viewBox="0 0 265 62">
<g transform="translate(.5 .5)">
<path d="M 20 21 v 20 m 10 -20 v 20 m -10 -10 h 20.5"></path>
<g>
<path d="M40 31h0"></path>
<path d="M224 31h0"></path>
<path d="M40 31h10"></path>
<g>
<path d="M50 31h0"></path>
<path d="M94 31h0"></path>
<rect x="50" y="20" width="44" height="22" rx="10" ry="10"></rect>
<text x="72" y="35">&#91;#&#93;</text>
</g>
<path d="M94 31h10"></path>
<path d="M104 31h10"></path>
<g>
<path d="M114 31h0"></path>
<path d="M214 31h0"></path>
<rect x="114" y="20" width="100" height="22"></rect>
<text x="164" y="35">identifier</text>
</g>
<path d="M214 31h10"></path>
</g>
<path d="M 224 31 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
</g>
</svg>

**bool**

<svg class="railroad-diagram" width="837" height="240" viewBox="0 0 837 240">
<g transform="translate(.5 .5)">
<path d="M 20 21 v 20 m 10 -20 v 20 m -10 -10 h 20.5"></path>
<g>
<path d="M40 31h0"></path>
<path d="M796 31h0"></path>
<g>
<path d="M40 31h0"></path>
<path d="M584 31h0"></path>
<path d="M40 31h20"></path>
<g>
<path d="M60 31h0"></path>
<path d="M564 31h0"></path>
<path d="M60 31h10"></path>
<g>
<path d="M70 31h0"></path>
<path d="M210 31h0"></path>
<rect x="70" y="20" width="140" height="22" rx="10" ry="10"></rect>
<text x="140" y="35">AnyCase("true")</text>
</g>
<path d="M210 31h10"></path>
<g>
<path d="M220 31h0"></path>
<path d="M564 31h0"></path>
<path d="M220 31h20"></path>
<g>
<path d="M240 31h304"></path>
</g>
<path d="M544 31h20"></path>
<path d="M220 31a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<g>
<path d="M240 51h0"></path>
<path d="M544 51h0"></path>
<path d="M 240 51 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
<g>
<path d="M260 51h0"></path>
<path d="M544 51h0"></path>
<path d="M260 51h20"></path>
<g>
<path d="M280 51h0"></path>
<path d="M524 51h0"></path>
<path d="M280 51h20"></path>
<g>
<path d="M300 51h0"></path>
<path d="M504 51h0"></path>
<path d="M300 51h20"></path>
<g>
<path d="M320 51h0"></path>
<path d="M484 51h0"></path>
<rect x="320" y="40" width="164" height="22" rx="10" ry="10"></rect>
<text x="402" y="55">core.atLetterLower</text>
</g>
<path d="M484 51h20"></path>
<path d="M300 51a10 10 0 0 1 10 10v10a10 10 0 0 0 10 10"></path>
<g>
<path d="M320 81h0"></path>
<path d="M484 81h0"></path>
<rect x="320" y="70" width="164" height="22" rx="10" ry="10"></rect>
<text x="402" y="85">core.atLetterUpper</text>
</g>
<path d="M484 81a10 10 0 0 0 10 -10v-10a10 10 0 0 1 10 -10"></path>
</g>
<path d="M504 51h20"></path>
<path d="M280 51a10 10 0 0 1 10 10v40a10 10 0 0 0 10 10"></path>
<g>
<path d="M300 111h64"></path>
<path d="M440 111h64"></path>
<rect x="364" y="100" width="76" height="22"></rect>
<text x="402" y="115">atDigit</text>
</g>
<path d="M504 111a10 10 0 0 0 10 -10v-40a10 10 0 0 1 10 -10"></path>
</g>
<path d="M524 51h20"></path>
<path d="M260 51a10 10 0 0 1 10 10v70a10 10 0 0 0 10 10"></path>
<g>
<path d="M280 141h44"></path>
<path d="M480 141h44"></path>
<rect x="324" y="130" width="156" height="22" rx="10" ry="10"></rect>
<text x="402" y="145">core.atUnderscore</text>
</g>
<path d="M524 141a10 10 0 0 0 10 -10v-70a10 10 0 0 1 10 -10"></path>
</g>
</g>
<path d="M544 51a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
</g>
</g>
<path d="M564 31h20"></path>
<path d="M40 31a10 10 0 0 1 10 10v129a10 10 0 0 0 10 10"></path>
<g>
<path d="M60 180h62"></path>
<path d="M502 180h62"></path>
<path d="M122 180h10"></path>
<g>
<path d="M132 180h0"></path>
<path d="M280 180h0"></path>
<rect x="132" y="169" width="148" height="22" rx="10" ry="10"></rect>
<text x="206" y="184">AnyCase("false")</text>
</g>
<path d="M280 180h10"></path>
<g>
<path d="M290 180h0"></path>
<path d="M502 180h0"></path>
<path d="M290 180h20"></path>
<g>
<path d="M310 180h172"></path>
</g>
<path d="M482 180h20"></path>
<path d="M290 180a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<g>
<path d="M310 200h0"></path>
<path d="M482 200h0"></path>
<path d="M 310 200 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
<path d="M330 200h10"></path>
<g>
<path d="M340 200h0"></path>
<path d="M472 200h0"></path>
<rect x="340" y="189" width="132" height="22"></rect>
<text x="406" y="204">identifierNext</text>
</g>
<path d="M472 200h10"></path>
</g>
<path d="M482 200a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
</g>
</g>
<path d="M564 180a10 10 0 0 0 10 -10v-129a10 10 0 0 1 10 -10"></path>
</g>
<g>
<path d="M584 31h0"></path>
<path d="M796 31h0"></path>
<path d="M584 31h20"></path>
<g>
<path d="M604 31h172"></path>
</g>
<path d="M776 31h20"></path>
<path d="M584 31a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<g>
<path d="M604 51h0"></path>
<path d="M776 51h0"></path>
<path d="M 604 51 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
<path d="M624 51h10"></path>
<g>
<path d="M634 51h0"></path>
<path d="M766 51h0"></path>
<rect x="634" y="40" width="132" height="22"></rect>
<text x="700" y="55">identifierNext</text>
</g>
<path d="M766 51h10"></path>
</g>
<path d="M776 51a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
</g>
</g>
<path d="M 796 31 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
</g>
</svg>

**null**

<svg class="railroad-diagram" width="665" height="91" viewBox="0 0 665 91">
<g transform="translate(.5 .5)">
<path d="M 20 21 v 20 m 10 -20 v 20 m -10 -10 h 20.5"></path>
<g>
<path d="M40 31h0"></path>
<path d="M624 31h0"></path>
<g>
<path d="M40 31h0"></path>
<path d="M412 31h0"></path>
<path d="M40 31h10"></path>
<g>
<path d="M50 31h0"></path>
<path d="M190 31h0"></path>
<rect x="50" y="20" width="140" height="22" rx="10" ry="10"></rect>
<text x="120" y="35">AnyCase("null")</text>
</g>
<path d="M190 31h10"></path>
<g>
<path d="M200 31h0"></path>
<path d="M412 31h0"></path>
<path d="M200 31h20"></path>
<g>
<path d="M220 31h172"></path>
</g>
<path d="M392 31h20"></path>
<path d="M200 31a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<g>
<path d="M220 51h0"></path>
<path d="M392 51h0"></path>
<path d="M 220 51 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
<path d="M240 51h10"></path>
<g>
<path d="M250 51h0"></path>
<path d="M382 51h0"></path>
<rect x="250" y="40" width="132" height="22"></rect>
<text x="316" y="55">identifierNext</text>
</g>
<path d="M382 51h10"></path>
</g>
<path d="M392 51a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
</g>
</g>
<g>
<path d="M412 31h0"></path>
<path d="M624 31h0"></path>
<path d="M412 31h20"></path>
<g>
<path d="M432 31h172"></path>
</g>
<path d="M604 31h20"></path>
<path d="M412 31a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<g>
<path d="M432 51h0"></path>
<path d="M604 51h0"></path>
<path d="M 432 51 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
<path d="M452 51h10"></path>
<g>
<path d="M462 51h0"></path>
<path d="M594 51h0"></path>
<rect x="462" y="40" width="132" height="22"></rect>
<text x="528" y="55">identifierNext</text>
</g>
<path d="M594 51h10"></path>
</g>
<path d="M604 51a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
</g>
</g>
<path d="M 624 31 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
</g>
</svg>

**nan**

<svg class="railroad-diagram" width="657" height="91" viewBox="0 0 657 91">
<g transform="translate(.5 .5)">
<path d="M 20 21 v 20 m 10 -20 v 20 m -10 -10 h 20.5"></path>
<g>
<path d="M40 31h0"></path>
<path d="M616 31h0"></path>
<g>
<path d="M40 31h0"></path>
<path d="M404 31h0"></path>
<path d="M40 31h10"></path>
<g>
<path d="M50 31h0"></path>
<path d="M182 31h0"></path>
<rect x="50" y="20" width="132" height="22" rx="10" ry="10"></rect>
<text x="116" y="35">AnyCase("nan")</text>
</g>
<path d="M182 31h10"></path>
<g>
<path d="M192 31h0"></path>
<path d="M404 31h0"></path>
<path d="M192 31h20"></path>
<g>
<path d="M212 31h172"></path>
</g>
<path d="M384 31h20"></path>
<path d="M192 31a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<g>
<path d="M212 51h0"></path>
<path d="M384 51h0"></path>
<path d="M 212 51 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
<path d="M232 51h10"></path>
<g>
<path d="M242 51h0"></path>
<path d="M374 51h0"></path>
<rect x="242" y="40" width="132" height="22"></rect>
<text x="308" y="55">identifierNext</text>
</g>
<path d="M374 51h10"></path>
</g>
<path d="M384 51a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
</g>
</g>
<g>
<path d="M404 31h0"></path>
<path d="M616 31h0"></path>
<path d="M404 31h20"></path>
<g>
<path d="M424 31h172"></path>
</g>
<path d="M596 31h20"></path>
<path d="M404 31a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<g>
<path d="M424 51h0"></path>
<path d="M596 51h0"></path>
<path d="M 424 51 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
<path d="M444 51h10"></path>
<g>
<path d="M454 51h0"></path>
<path d="M586 51h0"></path>
<rect x="454" y="40" width="132" height="22"></rect>
<text x="520" y="55">identifierNext</text>
</g>
<path d="M586 51h10"></path>
</g>
<path d="M596 51a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
</g>
</g>
<path d="M 616 31 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
</g>
</svg>

**i**

<svg class="railroad-diagram" width="641" height="91" viewBox="0 0 641 91">
<g transform="translate(.5 .5)">
<path d="M 20 21 v 20 m 10 -20 v 20 m -10 -10 h 20.5"></path>
<g>
<path d="M40 31h0"></path>
<path d="M600 31h0"></path>
<g>
<path d="M40 31h0"></path>
<path d="M388 31h0"></path>
<path d="M40 31h10"></path>
<g>
<path d="M50 31h0"></path>
<path d="M166 31h0"></path>
<rect x="50" y="20" width="116" height="22" rx="10" ry="10"></rect>
<text x="108" y="35">AnyCase("i")</text>
</g>
<path d="M166 31h10"></path>
<g>
<path d="M176 31h0"></path>
<path d="M388 31h0"></path>
<path d="M176 31h20"></path>
<g>
<path d="M196 31h172"></path>
</g>
<path d="M368 31h20"></path>
<path d="M176 31a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<g>
<path d="M196 51h0"></path>
<path d="M368 51h0"></path>
<path d="M 196 51 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
<path d="M216 51h10"></path>
<g>
<path d="M226 51h0"></path>
<path d="M358 51h0"></path>
<rect x="226" y="40" width="132" height="22"></rect>
<text x="292" y="55">identifierNext</text>
</g>
<path d="M358 51h10"></path>
</g>
<path d="M368 51a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
</g>
</g>
<g>
<path d="M388 31h0"></path>
<path d="M600 31h0"></path>
<path d="M388 31h20"></path>
<g>
<path d="M408 31h172"></path>
</g>
<path d="M580 31h20"></path>
<path d="M388 31a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<g>
<path d="M408 51h0"></path>
<path d="M580 51h0"></path>
<path d="M 408 51 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
<path d="M428 51h10"></path>
<g>
<path d="M438 51h0"></path>
<path d="M570 51h0"></path>
<rect x="438" y="40" width="132" height="22"></rect>
<text x="504" y="55">identifierNext</text>
</g>
<path d="M570 51h10"></path>
</g>
<path d="M580 51a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
</g>
</g>
<path d="M 600 31 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
</g>
</svg>

**literal**

<svg class="railroad-diagram" width="245" height="152" viewBox="0 0 245 152">
<g transform="translate(.5 .5)">
<path d="M 20 21 v 20 m 10 -20 v 20 m -10 -10 h 20.5"></path>
<g>
<path d="M40 31h0"></path>
<path d="M204 31h0"></path>
<path d="M40 31h20"></path>
<g>
<path d="M60 31h36"></path>
<path d="M148 31h36"></path>
<rect x="96" y="20" width="52" height="22"></rect>
<text x="122" y="35">bool</text>
</g>
<path d="M184 31h20"></path>
<path d="M40 31a10 10 0 0 1 10 10v10a10 10 0 0 0 10 10"></path>
<g>
<path d="M60 61h0"></path>
<path d="M184 61h0"></path>
<path d="M60 61h20"></path>
<g>
<path d="M80 61h16"></path>
<path d="M148 61h16"></path>
<rect x="96" y="50" width="52" height="22"></rect>
<text x="122" y="65">null</text>
</g>
<path d="M164 61h20"></path>
<path d="M60 61a10 10 0 0 1 10 10v10a10 10 0 0 0 10 10"></path>
<g>
<path d="M80 91h0"></path>
<path d="M164 91h0"></path>
<path d="M80 91h20"></path>
<g>
<path d="M100 91h0"></path>
<path d="M144 91h0"></path>
<rect x="100" y="80" width="44" height="22"></rect>
<text x="122" y="95">nan</text>
</g>
<path d="M144 91h20"></path>
<path d="M80 91a10 10 0 0 1 10 10v10a10 10 0 0 0 10 10"></path>
<g>
<path d="M100 121h8"></path>
<path d="M136 121h8"></path>
<rect x="108" y="110" width="28" height="22"></rect>
<text x="122" y="125">i</text>
</g>
<path d="M144 121a10 10 0 0 0 10 -10v-10a10 10 0 0 1 10 -10"></path>
</g>
<path d="M164 91a10 10 0 0 0 10 -10v-10a10 10 0 0 1 10 -10"></path>
</g>
<path d="M184 61a10 10 0 0 0 10 -10v-10a10 10 0 0 1 10 -10"></path>
</g>
<path d="M 204 31 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
</g>
</svg>

**escapedChar**

<svg class="railroad-diagram" width="313" height="62" viewBox="0 0 313 62">
<g transform="translate(.5 .5)">
<path d="M 20 21 v 20 m 10 -20 v 20 m -10 -10 h 20.5"></path>
<g>
<path d="M40 31h0"></path>
<path d="M272 31h0"></path>
<path d="M40 31h10"></path>
<g>
<path d="M50 31h0"></path>
<path d="M102 31h0"></path>
<rect x="50" y="20" width="52" height="22" rx="10" ry="10"></rect>
<text x="76" y="35">&#91;\\&#93;</text>
</g>
<path d="M102 31h10"></path>
<path d="M112 31h10"></path>
<g>
<path d="M122 31h0"></path>
<path d="M262 31h0"></path>
<rect x="122" y="20" width="140" height="22" rx="10" ry="10"></rect>
<text x="192" y="35">&#91;any character&#93;</text>
</g>
<path d="M262 31h10"></path>
</g>
<path d="M 272 31 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
</g>
</svg>

**templateString**

<svg class="railroad-diagram" width="517" height="138" viewBox="0 0 517 138">
<g transform="translate(.5 .5)">
<path d="M 20 30 v 20 m 10 -20 v 20 m -10 -10 h 20.5"></path>
<g>
<path d="M40 40h0"></path>
<path d="M476 40h0"></path>
<path d="M40 40h10"></path>
<g>
<path d="M50 40h0"></path>
<path d="M94 40h0"></path>
<rect x="50" y="29" width="44" height="22" rx="10" ry="10"></rect>
<text x="72" y="44">"&#96;"</text>
</g>
<path d="M94 40h10"></path>
<g>
<path d="M104 40h0"></path>
<path d="M476 40h0"></path>
<g>
<path d="M104 40h0"></path>
<path d="M328 40h0"></path>
<path d="M104 40h20"></path>
<g>
<path d="M124 40h0"></path>
<path d="M308 40h0"></path>
<path d="M124 40a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
<g>
<path d="M144 20h144"></path>
</g>
<path d="M288 20a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<path d="M124 40h20"></path>
<g>
<path d="M144 40h0"></path>
<path d="M288 40h0"></path>
<path d="M144 40h10"></path>
<g>
<path d="M154 40h0"></path>
<path d="M278 40h0"></path>
<path d="M154 40h20"></path>
<g>
<path d="M174 40h84"></path>
</g>
<path d="M258 40h20"></path>
<path d="M154 40a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<g>
<path d="M174 60h0"></path>
<path d="M258 60h0"></path>
<path d="M 174 60 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
<path d="M194 60h10"></path>
<g>
<path d="M204 60h0"></path>
<path d="M248 60h0"></path>
<rect x="204" y="49" width="44" height="22" rx="10" ry="10"></rect>
<text x="226" y="64">&#91;&#96;&#93;</text>
</g>
<path d="M248 60h10"></path>
</g>
<path d="M258 60a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
</g>
<path d="M278 40h10"></path>
<path d="M154 40a10 10 0 0 0 -10 10v28a10 10 0 0 0 10 10"></path>
<g>
<path d="M154 88h124"></path>
</g>
<path d="M278 88a10 10 0 0 0 10 -10v-28a10 10 0 0 0 -10 -10"></path>
</g>
<path d="M288 40h20"></path>
</g>
<path d="M308 40h20"></path>
<path d="M104 40a10 10 0 0 1 10 10v47a10 10 0 0 0 10 10"></path>
<g>
<path d="M124 107h38"></path>
<path d="M270 107h38"></path>
<rect x="162" y="96" width="108" height="22" rx="10" ry="10"></rect>
<text x="216" y="111">&#60;predicate></text>
</g>
<path d="M308 107a10 10 0 0 0 10 -10v-47a10 10 0 0 1 10 -10"></path>
</g>
<g>
<path d="M328 40h0"></path>
<path d="M476 40h0"></path>
<path d="M328 40h20"></path>
<g>
<path d="M348 40h32"></path>
<path d="M424 40h32"></path>
<rect x="380" y="29" width="44" height="22" rx="10" ry="10"></rect>
<text x="402" y="44">"&#96;"</text>
</g>
<path d="M456 40h20"></path>
<path d="M328 40a10 10 0 0 1 10 10v10a10 10 0 0 0 10 10"></path>
<g>
<path d="M348 70h0"></path>
<path d="M456 70h0"></path>
<rect x="348" y="59" width="108" height="22" rx="10" ry="10"></rect>
<text x="402" y="74">&#60;predicate></text>
</g>
<path d="M456 70a10 10 0 0 0 10 -10v-10a10 10 0 0 1 10 -10"></path>
</g>
</g>
</g>
<path d="M 476 40 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
</g>
</svg>

**singleQuotedString**

<svg class="railroad-diagram" width="517" height="138" viewBox="0 0 517 138">
<g transform="translate(.5 .5)">
<path d="M 20 30 v 20 m 10 -20 v 20 m -10 -10 h 20.5"></path>
<g>
<path d="M40 40h0"></path>
<path d="M476 40h0"></path>
<path d="M40 40h10"></path>
<g>
<path d="M50 40h0"></path>
<path d="M94 40h0"></path>
<rect x="50" y="29" width="44" height="22" rx="10" ry="10"></rect>
<text x="72" y="44">"'"</text>
</g>
<path d="M94 40h10"></path>
<g>
<path d="M104 40h0"></path>
<path d="M476 40h0"></path>
<g>
<path d="M104 40h0"></path>
<path d="M328 40h0"></path>
<path d="M104 40h20"></path>
<g>
<path d="M124 40h0"></path>
<path d="M308 40h0"></path>
<path d="M124 40a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
<g>
<path d="M144 20h144"></path>
</g>
<path d="M288 20a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<path d="M124 40h20"></path>
<g>
<path d="M144 40h0"></path>
<path d="M288 40h0"></path>
<path d="M144 40h10"></path>
<g>
<path d="M154 40h0"></path>
<path d="M278 40h0"></path>
<path d="M154 40h20"></path>
<g>
<path d="M174 40h84"></path>
</g>
<path d="M258 40h20"></path>
<path d="M154 40a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<g>
<path d="M174 60h0"></path>
<path d="M258 60h0"></path>
<path d="M 174 60 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
<path d="M194 60h10"></path>
<g>
<path d="M204 60h0"></path>
<path d="M248 60h0"></path>
<rect x="204" y="49" width="44" height="22" rx="10" ry="10"></rect>
<text x="226" y="64">&#91;'&#93;</text>
</g>
<path d="M248 60h10"></path>
</g>
<path d="M258 60a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
</g>
<path d="M278 40h10"></path>
<path d="M154 40a10 10 0 0 0 -10 10v28a10 10 0 0 0 10 10"></path>
<g>
<path d="M154 88h124"></path>
</g>
<path d="M278 88a10 10 0 0 0 10 -10v-28a10 10 0 0 0 -10 -10"></path>
</g>
<path d="M288 40h20"></path>
</g>
<path d="M308 40h20"></path>
<path d="M104 40a10 10 0 0 1 10 10v47a10 10 0 0 0 10 10"></path>
<g>
<path d="M124 107h38"></path>
<path d="M270 107h38"></path>
<rect x="162" y="96" width="108" height="22" rx="10" ry="10"></rect>
<text x="216" y="111">&#60;predicate></text>
</g>
<path d="M308 107a10 10 0 0 0 10 -10v-47a10 10 0 0 1 10 -10"></path>
</g>
<g>
<path d="M328 40h0"></path>
<path d="M476 40h0"></path>
<path d="M328 40h20"></path>
<g>
<path d="M348 40h32"></path>
<path d="M424 40h32"></path>
<rect x="380" y="29" width="44" height="22" rx="10" ry="10"></rect>
<text x="402" y="44">"'"</text>
</g>
<path d="M456 40h20"></path>
<path d="M328 40a10 10 0 0 1 10 10v10a10 10 0 0 0 10 10"></path>
<g>
<path d="M348 70h0"></path>
<path d="M456 70h0"></path>
<rect x="348" y="59" width="108" height="22" rx="10" ry="10"></rect>
<text x="402" y="74">&#60;predicate></text>
</g>
<path d="M456 70a10 10 0 0 0 10 -10v-10a10 10 0 0 1 10 -10"></path>
</g>
</g>
</g>
<path d="M 476 40 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
</g>
</svg>

**doubleQuotedString**

<svg class="railroad-diagram" width="533" height="138" viewBox="0 0 533 138">
<g transform="translate(.5 .5)">
<path d="M 20 30 v 20 m 10 -20 v 20 m -10 -10 h 20.5"></path>
<g>
<path d="M40 40h0"></path>
<path d="M492 40h0"></path>
<path d="M40 40h10"></path>
<g>
<path d="M50 40h0"></path>
<path d="M102 40h0"></path>
<rect x="50" y="29" width="52" height="22" rx="10" ry="10"></rect>
<text x="76" y="44">"\""</text>
</g>
<path d="M102 40h10"></path>
<g>
<path d="M112 40h0"></path>
<path d="M492 40h0"></path>
<g>
<path d="M112 40h0"></path>
<path d="M344 40h0"></path>
<path d="M112 40h20"></path>
<g>
<path d="M132 40h0"></path>
<path d="M324 40h0"></path>
<path d="M132 40a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
<g>
<path d="M152 20h152"></path>
</g>
<path d="M304 20a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<path d="M132 40h20"></path>
<g>
<path d="M152 40h0"></path>
<path d="M304 40h0"></path>
<path d="M152 40h10"></path>
<g>
<path d="M162 40h0"></path>
<path d="M294 40h0"></path>
<path d="M162 40h20"></path>
<g>
<path d="M182 40h92"></path>
</g>
<path d="M274 40h20"></path>
<path d="M162 40a10 10 0 0 1 10 10v0a10 10 0 0 0 10 10"></path>
<g>
<path d="M182 60h0"></path>
<path d="M274 60h0"></path>
<path d="M 182 60 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
<path d="M202 60h10"></path>
<g>
<path d="M212 60h0"></path>
<path d="M264 60h0"></path>
<rect x="212" y="49" width="52" height="22" rx="10" ry="10"></rect>
<text x="238" y="64">&#91;\"&#93;</text>
</g>
<path d="M264 60h10"></path>
</g>
<path d="M274 60a10 10 0 0 0 10 -10v0a10 10 0 0 1 10 -10"></path>
</g>
<path d="M294 40h10"></path>
<path d="M162 40a10 10 0 0 0 -10 10v28a10 10 0 0 0 10 10"></path>
<g>
<path d="M162 88h132"></path>
</g>
<path d="M294 88a10 10 0 0 0 10 -10v-28a10 10 0 0 0 -10 -10"></path>
</g>
<path d="M304 40h20"></path>
</g>
<path d="M324 40h20"></path>
<path d="M112 40a10 10 0 0 1 10 10v47a10 10 0 0 0 10 10"></path>
<g>
<path d="M132 107h42"></path>
<path d="M282 107h42"></path>
<rect x="174" y="96" width="108" height="22" rx="10" ry="10"></rect>
<text x="228" y="111">&#60;predicate></text>
</g>
<path d="M324 107a10 10 0 0 0 10 -10v-47a10 10 0 0 1 10 -10"></path>
</g>
<g>
<path d="M344 40h0"></path>
<path d="M492 40h0"></path>
<path d="M344 40h20"></path>
<g>
<path d="M364 40h28"></path>
<path d="M444 40h28"></path>
<rect x="392" y="29" width="52" height="22" rx="10" ry="10"></rect>
<text x="418" y="44">"\""</text>
</g>
<path d="M472 40h20"></path>
<path d="M344 40a10 10 0 0 1 10 10v10a10 10 0 0 0 10 10"></path>
<g>
<path d="M364 70h0"></path>
<path d="M472 70h0"></path>
<rect x="364" y="59" width="108" height="22" rx="10" ry="10"></rect>
<text x="418" y="74">&#60;predicate></text>
</g>
<path d="M472 70a10 10 0 0 0 10 -10v-10a10 10 0 0 1 10 -10"></path>
</g>
</g>
</g>
<path d="M 492 40 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
</g>
</svg>

**string**

<svg class="railroad-diagram" width="325" height="122" viewBox="0 0 325 122">
<g transform="translate(.5 .5)">
<path d="M 20 21 v 20 m 10 -20 v 20 m -10 -10 h 20.5"></path>
<g>
<path d="M40 31h0"></path>
<path d="M284 31h0"></path>
<path d="M40 31h20"></path>
<g>
<path d="M60 31h36"></path>
<path d="M228 31h36"></path>
<rect x="96" y="20" width="132" height="22"></rect>
<text x="162" y="35">templateString</text>
</g>
<path d="M264 31h20"></path>
<path d="M40 31a10 10 0 0 1 10 10v10a10 10 0 0 0 10 10"></path>
<g>
<path d="M60 61h0"></path>
<path d="M264 61h0"></path>
<path d="M60 61h20"></path>
<g>
<path d="M80 61h0"></path>
<path d="M244 61h0"></path>
<rect x="80" y="50" width="164" height="22"></rect>
<text x="162" y="65">singleQuotedString</text>
</g>
<path d="M244 61h20"></path>
<path d="M60 61a10 10 0 0 1 10 10v10a10 10 0 0 0 10 10"></path>
<g>
<path d="M80 91h0"></path>
<path d="M244 91h0"></path>
<rect x="80" y="80" width="164" height="22"></rect>
<text x="162" y="95">doubleQuotedString</text>
</g>
<path d="M244 91a10 10 0 0 0 10 -10v-10a10 10 0 0 1 10 -10"></path>
</g>
<path d="M264 61a10 10 0 0 0 10 -10v-10a10 10 0 0 1 10 -10"></path>
</g>
<path d="M 284 31 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
</g>
</svg>

**value**

<svg class="railroad-diagram" width="397" height="242" viewBox="0 0 397 242">
<g transform="translate(.5 .5)">
<path d="M 20 21 v 20 m 10 -20 v 20 m -10 -10 h 20.5"></path>
<g>
<path d="M40 31h0"></path>
<path d="M356 31h0"></path>
<path d="M40 31h20"></path>
<g>
<path d="M60 31h100"></path>
<path d="M236 31h100"></path>
<rect x="160" y="20" width="76" height="22"></rect>
<text x="198" y="35">comment</text>
</g>
<path d="M336 31h20"></path>
<path d="M40 31a10 10 0 0 1 10 10v10a10 10 0 0 0 10 10"></path>
<g>
<path d="M60 61h0"></path>
<path d="M336 61h0"></path>
<path d="M60 61h20"></path>
<g>
<path d="M80 61h84"></path>
<path d="M232 61h84"></path>
<rect x="164" y="50" width="68" height="22"></rect>
<text x="198" y="65">number</text>
</g>
<path d="M316 61h20"></path>
<path d="M60 61a10 10 0 0 1 10 10v10a10 10 0 0 0 10 10"></path>
<g>
<path d="M80 91h0"></path>
<path d="M316 91h0"></path>
<path d="M80 91h20"></path>
<g>
<path d="M100 91h64"></path>
<path d="M232 91h64"></path>
<rect x="164" y="80" width="68" height="22"></rect>
<text x="198" y="95">symbol</text>
</g>
<path d="M296 91h20"></path>
<path d="M80 91a10 10 0 0 1 10 10v10a10 10 0 0 0 10 10"></path>
<g>
<path d="M100 121h0"></path>
<path d="M296 121h0"></path>
<path d="M100 121h20"></path>
<g>
<path d="M120 121h40"></path>
<path d="M236 121h40"></path>
<rect x="160" y="110" width="76" height="22"></rect>
<text x="198" y="125">literal</text>
</g>
<path d="M276 121h20"></path>
<path d="M100 121a10 10 0 0 1 10 10v10a10 10 0 0 0 10 10"></path>
<g>
<path d="M120 151h0"></path>
<path d="M276 151h0"></path>
<path d="M120 151h20"></path>
<g>
<path d="M140 151h32"></path>
<path d="M224 151h32"></path>
<rect x="172" y="140" width="52" height="22"></rect>
<text x="198" y="155">word</text>
</g>
<path d="M256 151h20"></path>
<path d="M120 151a10 10 0 0 1 10 10v10a10 10 0 0 0 10 10"></path>
<g>
<path d="M140 181h0"></path>
<path d="M256 181h0"></path>
<path d="M140 181h20"></path>
<g>
<path d="M160 181h4"></path>
<path d="M232 181h4"></path>
<rect x="164" y="170" width="68" height="22"></rect>
<text x="198" y="185">string</text>
</g>
<path d="M236 181h20"></path>
<path d="M140 181a10 10 0 0 1 10 10v10a10 10 0 0 0 10 10"></path>
<g>
<path d="M160 211h0"></path>
<path d="M236 211h0"></path>
<rect x="160" y="200" width="76" height="22"></rect>
<text x="198" y="215">bracket</text>
</g>
<path d="M236 211a10 10 0 0 0 10 -10v-10a10 10 0 0 1 10 -10"></path>
</g>
<path d="M256 181a10 10 0 0 0 10 -10v-10a10 10 0 0 1 10 -10"></path>
</g>
<path d="M276 151a10 10 0 0 0 10 -10v-10a10 10 0 0 1 10 -10"></path>
</g>
<path d="M296 121a10 10 0 0 0 10 -10v-10a10 10 0 0 1 10 -10"></path>
</g>
<path d="M316 91a10 10 0 0 0 10 -10v-10a10 10 0 0 1 10 -10"></path>
</g>
<path d="M336 61a10 10 0 0 0 10 -10v-10a10 10 0 0 1 10 -10"></path>
</g>
<path d="M 356 31 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
</g>
</svg>

**sequence**

<svg class="railroad-diagram" width="201" height="92" viewBox="0 0 201 92">
<g transform="translate(.5 .5)">
<path d="M 20 21 v 20 m 10 -20 v 20 m -10 -10 h 20.5"></path>
<g>
<path d="M40 31h0"></path>
<path d="M160 31h0"></path>
<path d="M40 31h10"></path>
<g>
<path d="M50 31h0"></path>
<path d="M150 31h0"></path>
<path d="M50 31h10"></path>
<g>
<path d="M60 31h0"></path>
<path d="M140 31h0"></path>
<path d="M60 31h10"></path>
<g>
<path d="M70 31h0"></path>
<path d="M130 31h0"></path>
<rect x="70" y="20" width="60" height="22"></rect>
<text x="100" y="35">value</text>
</g>
<path d="M130 31h10"></path>
</g>
<path d="M140 31h10"></path>
<path d="M60 31a10 10 0 0 0 -10 10v10a10 10 0 0 0 10 10"></path>
<g>
<path d="M60 61h12"></path>
<path d="M128 61h12"></path>
<path d="M72 61h10"></path>
<g>
<path d="M82 61h0"></path>
<path d="M118 61h0"></path>
<rect x="82" y="50" width="36" height="22"></rect>
<text x="100" y="65">ws</text>
</g>
<path d="M118 61h10"></path>
</g>
<path d="M140 61a10 10 0 0 0 10 -10v-10a10 10 0 0 0 -10 -10"></path>
</g>
<path d="M150 31h10"></path>
</g>
<path d="M 160 31 h 20 m -10 -10 v 20 m 10 -20 v 20"></path>
</g>
</svg>


<style>
svg.railroad-diagram {
  background-color: hsl(30,20%,95%);
}
svg.railroad-diagram path {
  stroke-width: 3;
  stroke: black;
  fill: none;
}
svg.railroad-diagram text {
  font: bold 14px monospace;
  text-anchor: middle;
  cursor: pointer;
}
svg.railroad-diagram text.label {
  text-anchor: start;
}
svg.railroad-diagram text.comment {
  font: italic 12px monospace;
}
svg.railroad-diagram rect {
  stroke-width: 3;
  stroke: black;
  fill: hsl(120,100%,90%);
}
</style>

