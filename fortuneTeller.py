import tkinter as tk
from tkinter import messagebox, ttk
from datetime import datetime
import json

class FortuneTellerApp:
    def __init__(self, root):
        self.root = root
        self.root.title("โปรแกรมดูดวง - Fortune Teller")
        self.root.geometry("600x700")
        self.root.configure(bg="#f0f0f0")
        
        # Load horoscope data
        self.load_horoscope_data()
        
        # Create UI
        self.create_widgets()
    
    def load_horoscope_data(self):
        """Load horoscope data from JSON file"""
        try:
            with open("daily-horoscope.json", "r", encoding="utf-8") as f:
                self.data = json.load(f)
        except FileNotFoundError:
            messagebox.showerror("Error", "ไม่พบไฟล์ daily-horoscope.json")
            self.data = {"predictions": []}
    
    def get_zodiac_sign(self, month, day):
        """Get zodiac sign based on birth month and day"""
        zodiac_dates = [
            ("มีนา", 2, 19, 3, 20),      # Pisces
            ("เมษ", 3, 21, 4, 19),       # Aries
            ("พฤษภ", 4, 20, 5, 20),      # Taurus
            ("เมถุน", 5, 21, 6, 20),     # Gemini
            ("กรกฎ", 6, 21, 7, 22),      # Cancer
            ("สิงห์", 7, 23, 8, 22),     # Leo
            ("กันย์", 8, 23, 9, 22),     # Virgo
            ("ตุลย์", 9, 23, 10, 22),    # Libra
            ("พิจิก", 10, 23, 11, 21),   # Scorpio
            ("ธนู", 11, 22, 12, 21),     # Sagittarius
            ("มังกร", 12, 22, 1, 19),    # Capricorn
            ("กุมภ์", 1, 20, 2, 18),     # Aquarius
        ]
        
        for sign, start_month, start_day, end_month, end_day in zodiac_dates:
            if start_month == end_month:
                if month == start_month and start_day <= day <= end_day:
                    return sign
            else:
                if (month == start_month and day >= start_day) or (month == end_month and day <= end_day):
                    return sign
        return None
    
    def create_widgets(self):
        """Create UI widgets"""
        # Title
        title_label = tk.Label(
            self.root,
            text="โปรแกรมดูดวง 🌙",
            font=("Arial", 24, "bold"),
            bg="#f0f0f0",
            fg="#333333"
        )
        title_label.pack(pady=20)
        
        # Frame for date input
        input_frame = ttk.LabelFrame(self.root, text="กรุณากรอกวันเกิด", padding=15)
        input_frame.pack(padx=20, pady=10, fill="x")
        
        # Date selection
        date_frame = tk.Frame(input_frame, bg="#f0f0f0")
        date_frame.pack(fill="x")
        
        tk.Label(date_frame, text="วันเกิด:", font=("Arial", 10), bg="#f0f0f0").pack(side=tk.LEFT, padx=5)
        self.day_var = tk.StringVar(value="1")
        day_spinbox = ttk.Spinbox(date_frame, from_=1, to=31, textvariable=self.day_var, width=5)
        day_spinbox.pack(side=tk.LEFT, padx=5)
        
        tk.Label(date_frame, text="เดือน:", font=("Arial", 10), bg="#f0f0f0").pack(side=tk.LEFT, padx=5)
        self.month_var = tk.StringVar(value="1")
        months = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
                  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"]
        month_combo = ttk.Combobox(date_frame, textvariable=self.month_var, values=months, width=15, state="readonly")
        month_combo.current(0)
        month_combo.pack(side=tk.LEFT, padx=5)
        
        tk.Label(date_frame, text="ปี:", font=("Arial", 10), bg="#f0f0f0").pack(side=tk.LEFT, padx=5)
        self.year_var = tk.StringVar(value=str(datetime.now().year))
        year_spinbox = ttk.Spinbox(date_frame, from_=1900, to=2024, textvariable=self.year_var, width=8)
        year_spinbox.pack(side=tk.LEFT, padx=5)
        
        # Button to search
        button_frame = tk.Frame(self.root, bg="#f0f0f0")
        button_frame.pack(pady=10)
        
        search_button = tk.Button(
            button_frame,
            text="ดูดวง 🔮",
            font=("Arial", 12, "bold"),
            bg="#4CAF50",
            fg="white",
            padx=20,
            pady=10,
            command=self.show_horoscope
        )
        search_button.pack()
        
        # Result frame
        result_frame = ttk.LabelFrame(self.root, text="ผลการดูดวง", padding=15)
        result_frame.pack(padx=20, pady=10, fill="both", expand=True)
        
        # Result text with scrollbar
        scrollbar = ttk.Scrollbar(result_frame)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.result_text = tk.Text(
            result_frame,
            font=("Arial", 11),
            height=20,
            yscrollcommand=scrollbar.set
        )
        self.result_text.pack(fill="both", expand=True)
        scrollbar.config(command=self.result_text.yview)
    
    def show_horoscope(self):
        """Display horoscope based on selected date"""
        try:
            day = int(self.day_var.get())
            month = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
                     "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"].index(self.month_var.get()) + 1
            
            # Validate date
            if not (1 <= day <= 31):
                messagebox.showerror("Error", "กรุณากรอกวันที่ถูกต้อง (1-31)")
                return
            
            # Get zodiac sign
            zodiac_sign = self.get_zodiac_sign(month, day)
            
            if not zodiac_sign:
                messagebox.showerror("Error", "ไม่สามารถระบุราศีได้")
                return
            
            # Find prediction
            prediction = None
            for pred in self.data.get("predictions", []):
                if pred.get("sign") == zodiac_sign:
                    prediction = pred
                    break
            
            if not prediction:
                messagebox.showerror("Error", f"ไม่พบข้อมูลดวงสำหรับราศี {zodiac_sign}")
                return
            
            # Display result
            self.result_text.config(state=tk.NORMAL)
            self.result_text.delete("1.0", tk.END)
            
            month_names = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
                          "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"]
            
            result = f"""
{'='*50}
ผลการดูดวง
{'='*50}

ข้อมูลส่วนตัว:
  วันเกิด: {day} {month_names[month-1]} {self.year_var.get()}
  ราศี: {zodiac_sign}

{'='*50}
ผลการไทยรัฐ:
{'='*50}

📊 ภาพรวม:
{prediction.get('overall', 'ไม่มีข้อมูล')}

💕 ความรัก:
{prediction.get('love', 'ไม่มีข้อมูล')}

💼 การงาน:
{prediction.get('career', 'ไม่มีข้อมูล')}

💰 การเงิน:
{prediction.get('money', 'ไม่มีข้อมูล')}

🌈 เสี่ยงโชค:
  สีเสี่ยงโชค: {prediction.get('lucky_color', 'ไม่มีข้อมูล')}
  เลขเสี่ยงโชค: {prediction.get('lucky_number', 'ไม่มีข้อมูล')}

{'='*50}
วันดูดวง: {self.data.get('date', 'ไม่มีข้อมูล')}
{'='*50}
            """
            
            self.result_text.insert("1.0", result)
            self.result_text.config(state=tk.DISABLED)
            
        except ValueError:
            messagebox.showerror("Error", "กรุณากรอกข้อมูลที่ถูกต้อง")


def main():
    root = tk.Tk()
    app = FortuneTellerApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
