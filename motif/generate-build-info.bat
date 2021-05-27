@echo off
setlocal


:: Get the current Mercurial changeset hash with `hg id -i`
::
:: Copy output of command to variable
:: https://stackoverflow.com/a/6362922/395461
REM FOR /F "tokens=* USEBACKQ" %%F IN (`hg id -i`) DO (
REM SET CHANGESET_HASH=%%F
REM )

REM :: Get the current Mercurial revision number with `hg identify --num`
REM FOR /F "tokens=* USEBACKQ" %%F IN (`hg identify --num`) DO (
REM SET REVISION_NUMBER=%%F
REM )

:: Get the current Git commit hash with `git rev-parse --verify --short=N HEAD`
FOR /F "tokens=* USEBACKQ" %%F IN (`git rev-parse --verify --short HEAD`) DO (
SET CHANGESET_HASH=%%F
)

rem git rev-parse --verify --short=N HEAD

:: Write the values out to a typescript file.
:: echo export class ChangesetHash {public static readonly number = '%CHANGESET_HASH%'}; > src\changeset-hash.ts
echo export namespace BuildInfo { export const ChangesetHash = '%CHANGESET_HASH%'; }> src\generated\build-info.ts