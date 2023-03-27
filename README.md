# `entam`

entam은 `.ent` 파일을 효과적으로 관리하고 아카이브 할 수 있도록 도와주는 cli 프로그램입니다.

## 설치

entam을 사용하려면 deno가 설치되어 있어야 합니다.

`powershell`

```powershell
irm https://deno.land/install.ps1 | iex
```

deno를 설치한 다음, cli를 설치합니다.

```powershell
deno install -A -f -n entam https://deno.land/x/dutarch/cli.ts
```

현 위치를 entam의 저장소로 설정합니다.

```
entam init
```

entam을 사용하기 위한 모든 설정이 끝났습니다.

## 사용법

### 상자 생성

entam에 `.ent` 파일을 저장하고 불러오려면 상자를 생성해야 합니다.  
상자의 이름은 영어로 하는 것이 좋습니다.

```powershell
entam create box_name
```

### .ent 파일 주시

상자에 `.ent` 파일을 저장하고 불러오려면 주시할 `.ent` 파일을 지정해야 합니다.  
주시할 .env 파일이 있는 경로로 간 후 명령어를 실행하세요.

```powershell
entam box_name watch "확장자를 포함하지 않은 .ent 파일 이름"
```

### 아카이브 생성

상자가 `.ent` 파일을 주시하고 있다면, 다음 명령어를 실행해 아카이브를 생성할 수 있습니다.

```powershell
entam box_name archive --version 1.0.0 --msg test
```

version과 msg를 지정하지 않아도 아카이브를 생성하는 것에 큰 문제가 없지만,  
후에 아카이브를 빠르게 구별할 수 있도록 version과 msg를 지정하는 것이 좋습니다.

생성한 아카이브의 리소스와 이전 아카이브의 리소스와 겹치는 것이 있다면  
이전 아카이브의 리소스를 활용해 저장 공간을 아낍니다.

### 아카이브 목록 확인

상자에 아카이브가 있다면 아카이브 목록을 내림차순으로 확인할 수 있습니다.

```powershell
entam box_name list
```

```
0.0.2 3e87c918-b7bc-4c7a-8f17-a05d8c6bcdb5 update
0.0.2 3b7e7e8a-ccd7-45d4-8650-b8fb718d0a45 update
0.0.1 5934996d-e56d-41c3-a9dd-5f008870aa4c init
```

한도를 지정해 확인할 수 있습니다.

```powershell
entam box_name list --limit 1
```

```
0.0.2 3e87c918-b7bc-4c7a-8f17-a05d8c6bcdb5 update
```

특정 버전의 목록만 확인할 수 있습니다.

```powershell
entam box_name list --version 0.0.2
```

```
0.0.2 3e87c918-b7bc-4c7a-8f17-a05d8c6bcdb5 update
0.0.2 3b7e7e8a-ccd7-45d4-8650-b8fb718d0a45 update
```

### 아카이브 다운로드

가끔씩 이전 버전의 `.ent` 파일을 불러와야 할 때가 있습니다.  
다음 명령어를 입력해 상자에 저장되어 있는 데이터를 `.ent` 파일로 만들 수 있습니다.

```powershell
entam box_name pack --uuid "아카이브의 uuid"
```
