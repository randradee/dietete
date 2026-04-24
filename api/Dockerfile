# Multi-stage build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

# Copy all necessary files
COPY . .

# Restore and publish
RUN dotnet publish src/DieTete.Api/DieTete.Api.csproj -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0

WORKDIR /app

# Create uploads directory
RUN mkdir -p /app/uploads

# Copy published application
COPY --from=build /app/publish .

# Expose port
EXPOSE 8080

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Development

# Entry point
ENTRYPOINT ["dotnet", "DieTete.Api.dll"]
