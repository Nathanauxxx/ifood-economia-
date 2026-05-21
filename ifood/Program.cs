using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using ifood.Infrastructure.Data;
using ifood.Services;
using ifood.Domain.Repositories;
using ifood.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// 1. Configurar Entity Framework Core com SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Registros de Repositórios para Injeção de Dependência
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
builder.Services.AddScoped<ICategoriaRepository, CategoriaRepository>();
builder.Services.AddScoped<ITransacaoRepository, TransacaoRepository>();

// 2. Registrar o AuthService para Injeção de Dependência
builder.Services.AddScoped<IAuthService, AuthService>();

// 3. Configurar Autenticação JWT
var secretKey = builder.Configuration["JwtSettings:Secret"] ?? "ChaveSuperSecretaEExtremamenteLongaParaOFinanceiroAPI123456!";
var key = Encoding.ASCII.GetBytes(secretKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // Dev local
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"] ?? "FinanceiroApi",
        ValidateAudience = true,
        ValidAudience = builder.Configuration["JwtSettings:Audience"] ?? "FinanceiroWeb",
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// 4. Configurar CORS para permitir conexões do Front-end (React rodando localmente)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddControllers();

// 5. Configurar Swagger com suporte a JWT
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "Sistema Financeiro API", 
        Version = "v1",
        Description = "API Restful do back-end para o Sistema de Controle Financeiro Pessoal"
    });
    
    // Configuração de Autenticação JWT no Swagger
    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "JWT Authentication",
        Description = "Insira APENAS o seu token JWT (sem a palavra Bearer)",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    };
    
    c.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, securityScheme);
    c.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        { 
            new OpenApiSecuritySchemeReference(JwtBearerDefaults.AuthenticationScheme, document), 
            new List<string>() 
        }
    });
});

var app = builder.Build();

// Configurar o pipeline de requisições HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Sistema Financeiro API v1");
        c.RoutePrefix = string.Empty; // Swagger na raiz! Acessível em http://localhost:<porta>/
    });
}

app.UseCors("AllowAll");

app.UseHttpsRedirection();

app.UseDefaultFiles(); // Ativa index.html por padrão na raiz
app.UseStaticFiles();  // Permite servir arquivos estáticos no wwwroot

app.UseAuthentication(); // Deve vir ANTES do UseAuthorization!
app.UseAuthorization();

app.MapControllers();

app.Run();
