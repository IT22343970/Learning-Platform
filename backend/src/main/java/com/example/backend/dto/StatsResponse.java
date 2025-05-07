package com.example.backend.dto;

public class StatsResponse {
    private int total;
    private int count;
    private int newToday;
    private int active;

    public StatsResponse() {
    }

    public StatsResponse(int total) {
        this.total = total;
        this.count = total; // For backward compatibility
    }
    
    public StatsResponse(int total, int newToday, int active) {
        this.total = total;
        this.count = total; // For backward compatibility
        this.newToday = newToday;
        this.active = active;
    }

    // Getters and setters
    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }
    
    public int getCount() {
        return count;
    }
    
    public void setCount(int count) {
        this.count = count;
    }

    public int getNewToday() {
        return newToday;
    }

    public void setNewToday(int newToday) {
        this.newToday = newToday;
    }

    public int getActive() {
        return active;
    }

    public void setActive(int active) {
        this.active = active;
    }
}
