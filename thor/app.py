from flask import Flask, render_template, request, jsonify, send_file
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import io

app = Flask(__name__)

def scheduling_heuristic(n, release_times, processing_times):
    tasks = list(range(n))
    t = min(release_times)
    som = 0
    schedule = []

    while tasks:
        available_tasks = [i for i in tasks if release_times[i] <= t]
        if not available_tasks:
            t = min(release_times[i] for i in tasks)
            continue

        task = min(available_tasks, key=lambda x: processing_times[x])
        schedule.append((task, t, processing_times[task]))
        t = max(t + processing_times[task],
                min((release_times[i] for i in tasks if i != task), default=0))
        som += t

        tasks.remove(task)

    avg_completion_time = som / n
    return schedule, avg_completion_time

def plot_gantt(schedule):
    fig, ax = plt.subplots(figsize=(8, 4))

    # Draw tasks as rectangles
    for task, start_time, duration in schedule:
        ax.add_patch(
            mpatches.Rectangle(
                (start_time, 0), duration, 0.4, edgecolor='black', facecolor='white'
            )
        )
        ax.text(
            start_time + duration / 2,
            0.2,
            f"T{task + 1}",
            ha='center',
            va='center',
            fontsize=10
        )

    # Set axis limits and labels
    total_duration = max(start_time + duration for _, start_time, duration in schedule)
    ax.set_xlim(0, total_duration + 1)
    ax.set_ylim(-0.5, 0.5)
    ax.set_yticks([0])
    ax.set_yticklabels(["M1"])
    ax.set_xticks(range(total_duration + 2))
    ax.set_xlabel("temps", fontsize=12)

    # Draw timeline
    ax.axhline(0, color='black', linewidth=0.8, linestyle='-')

    # Remove unnecessary spines
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_visible(False)

    plt.tight_layout()

    # Save plot to a BytesIO object
    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    plt.close(fig)
    return img

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calculate', methods=['POST'])
def calculate_schedule():
    try:
        n = int(request.form['num_tasks'])
        release_times = list(map(int, request.form['release_times'].split(',')))
        processing_times = list(map(int, request.form['processing_times'].split(',')))

        if len(release_times) != n or len(processing_times) != n:
            return jsonify({'error': 'Mismatch in number of tasks and provided data.'}), 400

        schedule, avg_time = scheduling_heuristic(n, release_times, processing_times)
        schedule_str = [{"task": task + 1, "start_time": start, "duration": duration} for task, start, duration in schedule]

        return jsonify({
            'schedule': schedule_str,
            'avg_time': round(avg_time, 2)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/gantt', methods=['POST'])
def gantt_chart():
    try:
        n = int(request.form['num_tasks'])
        release_times = list(map(int, request.form['release_times'].split(',')))
        processing_times = list(map(int, request.form['processing_times'].split(',')))

        if len(release_times) != n or len(processing_times) != n:
            return "Mismatch in number of tasks and provided data.", 400

        schedule, _ = scheduling_heuristic(n, release_times, processing_times)
        img = plot_gantt(schedule)
        return send_file(img, mimetype='image/png')
    except Exception as e:
        return str(e), 400

if __name__ == '__main__':
    app.run(debug=True)
