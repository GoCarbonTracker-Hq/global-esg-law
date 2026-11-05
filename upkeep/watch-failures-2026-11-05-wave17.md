# Watch failures, GEL-04-11 run after wave 17 (2026-11-05)

Failures of the second 2026-11-05 run from a laptop address (209 of 1302 watchers; 41 produced a new `watch_failed` row in `upkeep/queue.csv`, the rest repeated an earlier failure and produced none). Watcher id, HTTP answer or exception, from `upkeep/seen.json`. Nothing was deleted; every failing watcher keeps its `second_route`. The first 2026-11-05 run (after wave 16) is in `watch-failures-2026-11-05.md`.

| Watcher id | Answer |
|---|---|
| in-companies-act-2013-indiacode-page | HTTP 403 |
| kr-kssb-ksds-kasb-list-page | TimeoutError: The read operation timed out |
| kr-krx-governance-report-krx-page | TimeoutError: The read operation timed out |
| nz-fmc-act-2013-part-7a-versions | HTTP 202 |
| nz-fsca-2021-39-versions | HTTP 202 |
| nz-fmc-climate-regs-2023-222-versions | HTTP 202 |
| nz-nzcs-1-latest-page | HTTP 202 |
| nz-nzcs-2-latest-page | HTTP 202 |
| nz-nzcs-3-latest-page | HTTP 202 |
| nz-ccra-zero-carbon-2019-61-versions | HTTP 202 |
| nz-ccra-2002-part-1b-versions | HTTP 202 |
| nz-ccra-2002-part-4-versions | HTTP 202 |
| nz-ets-stationary-energy-regs-2009-285-versions | HTTP 202 |
| nz-ets-liquid-fossil-fuels-regs-2008-356-versions | HTTP 202 |
| nz-ets-waste-regs-2010-338-versions | HTTP 202 |
| nz-ets-forestry-regs-2022-266-versions | HTTP 202 |
| sg-cpa-2018-sso-page | HTTP 403 |
| sg-cpa-mrv-regs-2018-sso-page | HTTP 403 |
| za-pa-g3-2025-banks-pdf-head | URLError: <urlopen error timed out> |
| za-jse-listings-8-63-pdf-head | HTTP 403 |
| th-cmsb-tor-jor-55-2563-sec-page | HTTP 403 |
| th-sec-issb-notifications-sec-page | HTTP 403 |
| th-sea-2535-s56-krisdika-page | certificate verify failed (Python) |
| id-perpres-98-2021-page | HTTP 403 |
| id-permen-lhk-21-2022-page | HTTP 403 |
| id-uu-4-2023-p2sk-page | HTTP 403 |
| se-sfs-2024-347-sfs-head | HTTP 403 |
| terms-se-sfs-adopted | HTTP 403 |
| terms-se-government-translation | HTTP 403 |
| mx-lgcc-diputados-pdf-head | URLError: <urlopen error timed out> |
| mx-lgcc-reg-rne-diputados-pdf-head | URLError: <urlopen error timed out> |
| mx-rne-gases-acuerdo-2015-dof-note-page | ConnectionResetError: [Errno 54] Connection reset by peer |
| mx-cnbv-emisoras-disposiciones-cnbv-pdf-head | certificate verify failed (Python) |
| fr-ordonnance-2023-1142-legifrance-page | HTTP 403 |
| fr-decret-2023-1394-legifrance-page | HTTP 403 |
| fr-code-commerce-l232-6-3-legifrance-page | HTTP 403 |
| fr-code-commerce-l233-28-4-legifrance-page | HTTP 403 |
| fr-devoir-de-vigilance-legifrance-page | HTTP 403 |
| fr-cmf-l533-22-1-legifrance-page | HTTP 403 |
| fr-decret-2021-663-legifrance-page | HTTP 403 |
| fr-code-env-l229-25-legifrance-page | HTTP 403 |
| fr-code-env-l229-68-legifrance-page | HTTP 403 |
| fr-code-energie-l100-4-legifrance-page | HTTP 403 |
| lt-company-reporting-act-tar-page | HTTP 403 |
| lt-financial-reporting-act-ix575-tar-page | HTTP 403 |
| lt-consolidated-reporting-act-ix576-tar-page | HTTP 403 |
| lt-climate-change-management-act-tar-page | HTTP 403 |
| lt-unfair-commercial-practices-act-tar-page | HTTP 403 |
| my-bursa-mmlr-sustainability-release-head | HTTP 403 |
| sa-environment-law-boe-page | URLError: <urlopen error timed out> |
| sa-air-quality-regulation-boe-page | URLError: <urlopen error timed out> |
| sa-anti-commercial-fraud-law-boe-page | URLError: <urlopen error timed out> |
| ph-ra-9729-elibrary-page | HTTP 403 |
| ph-ra-10174-elibrary-page | HTTP 403 |
| ph-ra-7394-ch6-advertising-elibrary-page | HTTP 403 |
| ph-sec-mc-16-2025-page | HTTP 403 |
| ph-sec-mc-4-2019-page | HTTP 403 |
| cn-szse-sustainability-guideline-17-szse-page | ConnectionResetError: [Errno 54] Connection reset by peer |
| co-sfc-ce-031-2021-sfc-file | HTTP 403 |
| co-sfc-ce-005-2022-sfc-file | HTTP 403 |
| co-sfc-ce-008-2022-sfc-file | HTTP 403 |
| co-sfc-ce-005-2024-sfc-file | HTTP 403 |
| co-sfc-ce-015-2025-sfc-file | HTTP 403 |
| co-ley-1931-2018-suin-annotations | certificate verify failed (Python) |
| co-ley-2169-2021-suin-annotations | certificate verify failed (Python) |
| co-ley-1819-2016-art221-223-suin-annotations | certificate verify failed (Python) |
| co-ley-2277-2022-art47-49-suin-annotations | certificate verify failed (Python) |
| co-decreto-926-2017-suin-annotations | certificate verify failed (Python) |
| co-decreto-969-2026-suin-annotations | certificate verify failed (Python) |
| co-ley-1480-2011-art29-33-suin-annotations | certificate verify failed (Python) |
| ar-ley-27520-normas-modifican | HTTP 500 |
| ar-decreto-1030-2020-normas-modifican | HTTP 500 |
| ar-ley-27430-titulo-iv-normas-modifican | HTTP 500 |
| ar-decreto-501-2018-normas-modifican | HTTP 500 |
| ar-ley-24240-normas-modifican | HTTP 500 |
| ar-dnu-274-2019-normas-modifican | HTTP 500 |
| ee-rps-amendment-2025-rt-xml | URLError: <urlopen error [Errno 8] nodename nor servname provided, or not known> |
| ee-tks-2024-825-act-rt-xml | URLError: <urlopen error [Errno 8] nodename nor servname provided, or not known> |
| ke-climate-change-act-2016-kenyalaw-page | HTTP 202 |
| ke-carbon-markets-regs-2024-kenyalaw-page | HTTP 202 |
| ke-emca-1999-kenyalaw-page | HTTP 202 |
| ke-cpa-2012-s12-13-kenyalaw-page | HTTP 202 |
| ma-ammc-circ-03-19-pdf-head | URLError: <urlopen error timed out> |
| ae-dl-11-2024-climate-portal-page | HTTP 403 |
| ae-law-24-1999-environment-portal-page | HTTP 403 |
| ae-law-15-2020-consumer-protection-portal-page | HTTP 403 |
| ae-cr-66-2023-consumer-protection-regulation-portal-page | HTTP 403 |
| pk-climate-change-act-2017-pdf | certificate verify failed (Python) |
| pk-epa-1997-pdf | certificate verify failed (Python) |
| pk-petroleum-levy-climate-support-levy-pdf | certificate verify failed (Python) |
| pk-competition-act-2010-s10-pdf | certificate verify failed (Python) |
| pk-terms-pakistancode-consolidated | certificate verify failed (Python) |
| pk-terms-na-adopted | certificate verify failed (Python) |
| pk-terms-secp-adopted | HTTP 403 |
| ec-sb-saras-norm-codificacion-pdf | URLError: <urlopen error timed out> |
| ua-law-377-ix-rada-page | URLError: <urlopen error timed out> |
| ua-accounting-law-996-rada-page | URLError: <urlopen error timed out> |
| ua-climate-policy-law-3991-rada-page | URLError: <urlopen error timed out> |
| ua-env-protection-law-1264-rada-page | URLError: <urlopen error timed out> |
| ua-consumer-protection-law-3153-rada-page | URLError: <urlopen error timed out> |
| ua-advertising-law-270-rada-page | URLError: <urlopen error timed out> |
| mt-csr-act-2026-legislation-mt | HTTP 403 |
| mt-csr-act-2026-commencement-ln-61-legislation-mt | HTTP 403 |
| mt-csr-regulations-2026-legislation-mt | HTTP 403 |
| mt-csr-amendment-regulations-2026-legislation-mt | HTTP 403 |
| mt-climate-action-act-2024-legislation-mt | HTTP 403 |
| mt-climate-action-act-2024-commencement-ln-248-legislation-mt | HTTP 403 |
| mt-climate-action-act-2015-legislation-mt | HTTP 403 |
| mt-ghg-inventory-regs-legislation-mt | HTTP 403 |
| mt-ets-stationary-regs-legislation-mt | HTTP 403 |
| mt-ets-aviation-regs-legislation-mt | HTTP 403 |
| mt-ets2-regs-legislation-mt | HTTP 403 |
| mt-ets-maritime-regs-legislation-mt | HTTP 403 |
| mt-cbam-implementing-regs-legislation-mt | HTTP 403 |
| mt-consumer-affairs-act-part-viii-legislation-mt | HTTP 403 |
| mt-terms-legislation-adopted | HTTP 403 |
| mt-terms-legislation-consolidated | HTTP 403 |
| mk-nbrm-bank-disclosure-decision-gazette-pdf | certificate verify failed (Python) |
| mk-law-environment-gazette-pdf | certificate verify failed (Python) |
| mk-law-consumer-protection-gazette-pdf | certificate verify failed (Python) |
| terms-mk-slvesnik-adopted | certificate verify failed (Python) |
| by-res-137-2021-card | HTTP 403 |
| by-res-130-2024-card | HTTP 403 |
| by-law-294-z-2023-card | HTTP 403 |
| by-law-295-z-2023-card | HTTP 403 |
| by-law-air-protection-2008-card | HTTP 403 |
| by-law-advertising-2007-card | HTTP 403 |
| by-law-consumer-rights-2002-card | HTTP 403 |
| by-law-env-protection-1992-card | HTTP 403 |
| qa-qcb-sustainability-reporting-framework-qcb-pdf-hash | certificate verify failed (Python) |
| bh-cbb-esg-module-pdf | HTTP 403 |
| jo-jsc-esg-code-pdf | URLError: <urlopen error timed out> |
| om-environment-law-mjla-pdf | certificate verify failed (Python) |
| om-drinking-water-protection-law-mjla-pdf | certificate verify failed (Python) |
| om-nature-reserves-law-mjla-pdf | certificate verify failed (Python) |
| om-consumer-protection-law-mjla-pdf | certificate verify failed (Python) |
| md-law-1515-1993-legis-home | HTTP 403 |
| mz-lei-20-97-ambiente-imprensanac-page | URLError: <urlopen error [Errno 65] No route to host> |
| mz-lei-22-2009-consumidor-imprensanac-page | URLError: <urlopen error [Errno 65] No route to host> |
| mz-decreto-23-2018-redd-imprensanac-page | URLError: <urlopen error [Errno 65] No route to host> |
| sn-loi-2023-15-code-environnement-page | URLError: <urlopen error timed out> |
| sn-decret-2025-227-jo | URLError: <urlopen error timed out> |
| sn-loi-2021-25-consommateur-jo | URLError: <urlopen error timed out> |
| zm-gecc-act-2024-official-page | certificate verify failed (Python) |
| zm-gecc-carbon-market-regs-2026-official-page | certificate verify failed (Python) |
| zm-gecc-amendment-act-2026-official-page | certificate verify failed (Python) |
| zm-ema-2011-official-page | certificate verify failed (Python) |
| zm-ema-amendment-act-2023-official-page | certificate verify failed (Python) |
| zm-ema-amendment-act-2026-official-page | certificate verify failed (Python) |
| zm-ccpa-2010-official-page | certificate verify failed (Python) |
| zm-ccpa-amendment-act-2023-official-page | certificate verify failed (Python) |
| ga-ordonnance-019-2021-jo-page | URLError: <urlopen error timed out> |
| ga-loi-018-2022-jo-page | URLError: <urlopen error timed out> |
| ga-decret-00291-2022-jo-page | URLError: <urlopen error timed out> |
| ga-decret-0054-2025-jo-page | URLError: <urlopen error timed out> |
| ga-loi-041-2025-jo-page | URLError: <urlopen error timed out> |
| ga-loi-002-2026-jo-page | URLError: <urlopen error timed out> |
| ga-loi-007-2014-jo-page | URLError: <urlopen error timed out> |
| ga-decret-0020-2022-jo-page | URLError: <urlopen error timed out> |
| ga-loi-14-98-jo-page | URLError: <urlopen error timed out> |
| mu-bom-climate-risk-guideline-2022-bom-pdf | certificate verify failed (Python) |
| gn-code-environnement-2019-medd-pdf | HTTP 502 |
| cu-res-106-2025-carbon-market-gaceta-page | URLError: <urlopen error timed out> |
| gt-ley-marco-cambio-climatico-congreso-pdf | HTTP 403 |
| gt-ley-proteccion-mejoramiento-medio-ambiente-congreso-pdf | HTTP 403 |
| gt-ley-proteccion-consumidor-usuario-congreso-pdf | HTTP 403 |
| ag-eccb-climate-risk-standard-enforced-page | HTTP 403 |
| terms-ag-eccb-adopted | HTTP 403 |
| gd-eccb-climate-risk-standard-enforced-page | HTTP 403 |
| dm-eccb-climate-risk-standard-enforced-page | HTTP 403 |
| bo-ley-300-gaceta-number-search | URLError: <urlopen error [Errno 8] nodename nor servname provided, or not known> |
| bo-ds-1696-gaceta-number-search | URLError: <urlopen error [Errno 8] nodename nor servname provided, or not known> |
| bo-ley-1333-gaceta-number-search | URLError: <urlopen error [Errno 8] nodename nor servname provided, or not known> |
| bo-ds-24176-gaceta-number-search | URLError: <urlopen error [Errno 8] nodename nor servname provided, or not known> |
| bo-ds-3549-gaceta-number-search | URLError: <urlopen error [Errno 8] nodename nor servname provided, or not known> |
| bo-ds-5264-gaceta-number-search | URLError: <urlopen error [Errno 8] nodename nor servname provided, or not known> |
| bo-ley-835-gaceta-number-search | URLError: <urlopen error [Errno 8] nodename nor servname provided, or not known> |
| bo-ley-453-gaceta-number-search | URLError: <urlopen error [Errno 8] nodename nor servname provided, or not known> |
| mm-environmental-conservation-law-2012-monrec-page | URLError: <urlopen error [Errno 61] Connection refused> |
| mm-environmental-conservation-rules-2014-monrec-page | URLError: <urlopen error [Errno 61] Connection refused> |
| mm-consumer-protection-law-2019-mlis-page | URLError: <urlopen error timed out> |
| vu-price-monitoring-consumer-affairs-act-paclii-hash | HTTP 403 |
| tm-terms-mejlis-consolidated | IncompleteRead: IncompleteRead(60408 bytes read) |
| bn-ghg-directive-2023-press-release | certificate verify failed (Python) |
| bt-waste-regulation-2012-item | URLError: <urlopen error _ssl.c:1129: The handshake operation timed out> |
| kg-climate-law-104-cbd-document | RemoteDisconnected: Remote end closed connection without response |
| kg-ghg-emission-law-71-cbd-document | RemoteDisconnected: Remote end closed connection without response |
| kg-env-protection-law-53-cbd-document | RemoteDisconnected: Remote end closed connection without response |
| kg-air-protection-law-51-cbd-document | RemoteDisconnected: Remote end closed connection without response |
| kg-res-133-2026-cbd-document | RemoteDisconnected: Remote end closed connection without response |
| kg-res-133-regulation-2026-cbd-document | HTTP 403 |
| kg-consumer-rights-law-90-cbd-document | HTTP 403 |
| kg-advertising-law-155-cbd-document | HTTP 403 |
| terms-tt-cbtt-adopted | TimeoutError: The read operation timed out |
| gm-climate-change-act-2026-meccnar-acts-page | certificate verify failed (Python) |
| gm-nema-1994-pdf-head | certificate verify failed (Python) |
| jm-nrca-permits-licences-regs-1996-head | certificate verify failed (Python) |
| jm-nrca-prohibition-order-1996-head | certificate verify failed (Python) |
| jm-nrca-ambient-air-quality-regs-1996-head | certificate verify failed (Python) |
| jm-nrca-plastic-packaging-order-2024-head | certificate verify failed (Python) |
| terms-jm-nepa | certificate verify failed (Python) |
| terms-rw-bnr-adopted | HTTP 403 |
| vc-eccb-climate-risk-standard-enforced-page | HTTP 403 |
| terms-vc-eccb-adopted | HTTP 403 |
| vc-consumer-protection-act-2020-gazette | certificate verify failed (Python) |
| terms-vc-legal-adopted | certificate verify failed (Python) |
| terms-ls-cbl-adopted | certificate verify failed (Python) |
| cm-loi-96-12-minepded | certificate verify failed (Python) |
| terms-cm-minepded | certificate verify failed (Python) |
