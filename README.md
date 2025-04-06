# geonames-mcp

A small Model Context Protocol server that knows how to query the [Geonames](http://www.geonames.org) API in order to look up toponyms for cartographic research.

The repo also doubles as a home for [Claude Code](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/), which can actually make use of the MPC server, and can read the local [`CLAUDE.md`](/CLAUDE.md) file in order to be guided in its agentic behavior for orchestrating & performing such lookups and formatting their results.

## Setup

```sh
# Configure
cp .env.example .env

# Build
yarn install
yarn build

# Inspect using MCP Inspector
DEBUG=1 npx @modelcontextprotocol/inspector node /path/to/geonames-mcp/build/index.js

# Add to Claude Code
claude mcp add --scope local geonames node /Users/roop/src/me/geonames-mcp/build/index.js
```

## Example

```sh
# Launch Claude Code, already configured^ with this MCP server
$ claude

# Verify the MCP server
> /mcp

# Ask for research
> Find the following place names in london, uk: south kensington, soho, fitzrovia, belsize. Give me Dublin and Belfast in ireland as well                                                

# […possibly some cajoling, since Claude isnt fully deterministic and sometimes makes weird choices…]

# Ask for results
> Write to results.csv
```

Resulting in the following output:

```csv
searchTerm,toponymName,featureType,longitude,latitude,hierarchy,alternateNames,ID,URL
South Kensington,South Kensington,section of populated place,-0.17321,51.49437,Europe > United Kingdom > England > Greater London > Royal Kensington and Chelsea,"South Kensington,사우스켄싱턴,サウス・ケンジントン,De Kensington,Kinsentona Meridiana,جنوبی کینزنگٹن,ساوث كنزنغتون,کنزینقتون جنوبی,کنزینگتون جنوبی,דרום קנזינגטון,דרום קענזינגטאן,Νότιο Κένσινγκτον,Јужен Кензингтон,Къилба Кенсингтон,Паўднёвы Кенсінгтон,Південний Кенсінгтон,Южный Кенсингтон,Հարավային Կենսինգտոն,දකුණු කෙන්සින්ග්ටොන්,南肯辛頓,南肯辛顿",2637395,https://api.geonames.org/searchJSON?username=<replace>&name=Kensington&country=GB
Soho,Soho,section of populated place,-0.13535,51.5144,Europe > United Kingdom > England > Greater London > City of Westminster,"Soho,소호,ソーホー,سوهو,سوہو، لندن,סוהו,Соха,Сохо,सोहो,倫敦蘇豪區",6545173,https://api.geonames.org/searchJSON?username=<replace>&name=soho&country=GB
Fitzrovia,Fitzrovia,section of populated place,-0.13478,51.51859,Europe > United Kingdom > England > Greater London > Camden,"Fitzrovia,フィッツロヴィア,NoHo,فتزروفيا,فٹزروویا,פיצרוביה,Фицровия,Фіцровія,Ֆիցրովիա,फ़िट्ज़रोविया,菲茨羅維亞",6545172,https://api.geonames.org/searchJSON?username=<replace>&name=fitzrovia&country=GB
Belsize,Belsize,section of populated place,-0.16659,51.54611,Europe > United Kingdom > England > Greater London > Camden,,12048394,https://api.geonames.org/searchJSON?username=<replace>&name=belsize&country=GB
Dublin,Dublin,capital of a political entity,-6.24889,53.33306,Europe > Ireland > Leinster > Dublin City,"Dublin,ܕܒܠܢ,더블린,ደብሊን,ダブリン,ดับลิน,Baile Átha Cliath,Ciudá de Dublín,Dablin,Diblin,Difelin,Divlyn,DUB,Düblin,Dublín,Dublîn,Dublina,Dublinas,Dublin city,Dublini,Dublino,Dublinu,Dulenn,Dulyn,Dyflinn,Eblana,IEDUB,ډبلن,دبلن,دۇبلىن,دوبلین,دوبلين,ڈبلن,דבלין,דובלין,Δουβλίνο,Даблин,Дублин,Дъблин,དུབ་ལིན།,Դուբլին,დუბლინი,डब्लिन,दब्लिन,ਡਬਲਿਨ,ಡಬ್ಲಿನ್,டப்லின்,ഡബ്ലിൻ,ডাবলিন,ဒပ်ဗလင်မြို့,都柏林",2964574,https://api.geonames.org/searchJSON?username=<replace>&name=dublin&country=IE
Belfast,Belfast,seat of a first-order administrative division,-5.92541,54.59682,Europe > United Kingdom > Northern Ireland > Belfast,"Belfast,밸파스트,벨파스트,ベルファスト,เบลฟัสต์,Béal Feirste,Beeal Feirshtey,Bélfast,Bèlfast,Belfāsta,Belfastas,Belfast City,Belfasto,Belfastum,Belffast,Belpas,Beul-Feirste,BFS,GBBEL,IEBEF,بلفاست,بیلفاسٹ,בלפאסט,בעלפאסט,Μπέλφαστ,Белфаст,Բելֆաստ,ბელფასტი,बेलफास्ट,ಬೆಲ್‌ಫಾಸ್ಟ್‌,பெல்பாஸ்ட்,বেলফাস্ট,ဗဲလဖတ်မြို့,貝爾法斯特,贝尔法斯特",2655984,https://api.geonames.org/searchJSON?username=<replace>&name=belfast&country=GB
```