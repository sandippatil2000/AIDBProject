using DBChatPro;
using DBChatPro.Services;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddSingleton<IConnectionService, InMemoryConnectionService>();

builder.Services.AddScoped<IDatabaseService, DatabaseManagerService>();
builder.Services.AddScoped<MySqlDatabaseService>();
builder.Services.AddScoped<SqlServerDatabaseService>();
builder.Services.AddScoped<PostgresDatabaseService>();
builder.Services.AddScoped<OracleDatabaseService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {

        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();   // Serves the documentation as a JSON endpoint
    app.UseSwaggerUI(); // Serves the interactive web-based UI
}
app.UseHttpsRedirection();

app.UseAuthorization();


app.MapControllers();

app.UseCors("AllowAll");
app.Run();
