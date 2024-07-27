using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Net;
using System.Text;

namespace pHueControl.Controllers
{
    public class LightRequest
    {
        public int id { get; set; }
        public string BridgeAddress { get; set; }
        public string Username { get; set; }
    }

    [ApiController]
    [Route("[controller]")]
    public class LightsController : Controller
    {
        public class LightState
        {
#pragma warning disable IDE1006 // Naming Styles    => properties passed as is to the API and API needs them lowercase
            public bool on { get; set; }
            public int sat {  get; set; }
            public int bri {  get; set; }
            public int hue { get; set; }
#pragma warning restore IDE1006 // Naming Styles
        }

        public LightsController()
        {
            //WIP only use for static config data
            //BridgeAddress = IPAddress.Parse("192.168.178.25");
            //Username = "iBKhJkMZEwQe8hmA8Haj0WNM2ppwHzde82JfuJIL";
        }

        [HttpPost("lights/off")]
        public async Task<IActionResult> SetAllLightsOff([FromBody] List<int> lightIds, [FromQuery] LightRequest lightRequest)
        {
            LightState lightState = new();
            lightState.on = false;

            foreach (int lightId in lightIds)
            {
                await SetLightState(lightId, lightState, lightRequest);
            }

            return Ok();
        }

        /// <summary>
        /// GetLightState
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetLightState(int id, [FromQuery] LightRequest lightRequest)
        {
            HttpClientHandler handler = new()
            {
                ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
            };

            HttpClient client = new(handler);
            HttpRequestMessage request = new()
            {
                Method = HttpMethod.Get,
                RequestUri = new Uri($"https://{lightRequest.BridgeAddress}/api/{lightRequest.Username}/lights/{id}"),
            };

            HttpResponseMessage response = await client.SendAsync(request);
            response.EnsureSuccessStatusCode();

            string responseContent = await response.Content.ReadAsStringAsync();

            return Ok(responseContent);
        }

        /// <summary>
        /// GetAllLights
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet()]
        public async Task<IActionResult> GetAllLights([FromQuery] LightRequest lightRequest)
        {
            HttpClientHandler handler = new()
            {
                ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
            };

            HttpClient client = new(handler);
            HttpRequestMessage request = new()
            {
                Method = HttpMethod.Get,
                RequestUri = new Uri($"https://{lightRequest.BridgeAddress}/api/{lightRequest.Username}/lights"),
            };

            HttpResponseMessage response = await client.SendAsync(request);
            response.EnsureSuccessStatusCode();

            string responseContent = await response.Content.ReadAsStringAsync();

            return Ok(responseContent);
        }

        /// <summary>
        /// SetLightState
        /// </summary>
        /// <param name="id"></param>
        /// <param name="lightState"></param>
        /// <returns></returns>
        [HttpPut("{id}/state")]
        public async Task<IActionResult> SetLightState(int id, [FromBody] LightState lightState, [FromQuery] LightRequest lightRequest)
        {
            HttpClientHandler handler = new()
            {
                ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
            };

            HttpClient client = new(handler);
            HttpRequestMessage request = new()
            {
                Method = HttpMethod.Put,
                RequestUri = new Uri($"https://{lightRequest.BridgeAddress}/api/{lightRequest.Username}/lights/{id}/state"),
                Content = new StringContent(JsonConvert.SerializeObject(lightState), Encoding.UTF8, "application/json")
            };

            HttpResponseMessage response = await client.SendAsync(request);
            response.EnsureSuccessStatusCode();

            string responseContent = await response.Content.ReadAsStringAsync();

            return Ok(responseContent);
        }
    }
}
