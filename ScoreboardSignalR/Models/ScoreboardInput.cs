namespace ConsoleSignalRServer.Models;

public class ScoreboardInput
{
    // Player 1 Fields
    public string ClanPrefix1 { get; set; }
    public string Name1 { get; set; }
    public int Score1 { get; set; }
    public string Country1 { get; set; }
    public string Character1 { get; set; }

    // Player 2 Fields
    public string ClanPrefix2 { get; set; }
    public string Name2 { get; set; }
    public int Score2 { get; set; }
    public string Country2 { get; set; }
    public string Character2 { get; set; }

    // Round Info
    public string Round { get; set; }

    // Upcoming Match
    public string Upcoming1 { get; set; }
    public string Upcoming2 { get; set; }

    // Prize Pool
    public string PrizePool { get; set; }
}
