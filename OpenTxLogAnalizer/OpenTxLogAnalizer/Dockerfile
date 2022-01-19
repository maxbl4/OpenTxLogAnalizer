FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY ["OpenTxLogAnalizer/OpenTxLogAnalizer.csproj", "OpenTxLogAnalizer/"]
RUN dotnet restore "OpenTxLogAnalizer/OpenTxLogAnalizer.csproj"
COPY . .
WORKDIR "/src/OpenTxLogAnalizer"
RUN dotnet build "OpenTxLogAnalizer.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "OpenTxLogAnalizer.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "OpenTxLogAnalizer.dll"]
