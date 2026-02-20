import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Label } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[var(--bg-card)] p-4 border border-[var(--border-light)] rounded-xl shadow-xl z-50">
                <p className="font-black text-[var(--text-main)] mb-2">{label}</p>
                <div className="space-y-1">
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs font-bold">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-[var(--text-muted)] capitalize">{entry.name}:</span>
                            <span className="text-[var(--text-main)] ml-auto">{entry.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

const StreakChart = ({ data, type = 'bar' }) => {
    // Shared props for all chart types
    const commonProps = {
        data: data,
        margin: { top: 10, right: 10, left: 10, bottom: 20 }, // Increased margins
    };

    const axisProps = {
        tick: { fontSize: 10, fill: 'var(--text-muted)', fontWeight: 700 }, // No font change needed really, but kept small
        axisLine: false,
        tickLine: false,
    };

    // Y Axis Configuration with Label
    const renderYAxis = () => (
        <YAxis
            {...axisProps}
            domain={[0, dataMax => Math.max(dataMax, 12)]}
            label={{
                value: 'Activity Count',
                angle: -90,
                position: 'insideLeft',
                offset: 15,
                style: { fill: 'var(--text-muted)', fontSize: 9, fontWeight: 700, textAnchor: 'middle' }
            }}
        />
    );

    const renderChart = () => {
        switch (type) {
            case 'line':
                return (
                    <LineChart {...commonProps}>
                        <CartesianGrid vertical={false} stroke="var(--border-light)" strokeDasharray="3 3" opacity={0.5} />
                        <XAxis dataKey="day" {...axisProps} dy={10} interval={0} />
                        {renderYAxis()}
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--text-muted)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                        <Line type="monotone" dataKey="vocab" name="Added" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="learn" name="Learn" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="listening" name="Listen" stroke="#a855f7" strokeWidth={3} dot={{ r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="game" name="Game" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="mastered" name="Mastered" stroke="#f97316" strokeWidth={3} dot={{ r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                    </LineChart>
                );
            case 'area':
                return (
                    <AreaChart {...commonProps}>
                        <defs>
                            <linearGradient id="colorVocab" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorListening" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="var(--border-light)" strokeDasharray="3 3" opacity={0.5} />
                        <XAxis dataKey="day" {...axisProps} dy={10} interval={0} />
                        {renderYAxis()}
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="vocab" name="Added" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVocab)" />
                        <Area type="monotone" dataKey="learn" name="Learn" stroke="#f59e0b" fillOpacity={0.1} fill="#f59e0b" />
                        <Area type="monotone" dataKey="listening" name="Listen" stroke="#a855f7" fillOpacity={1} fill="url(#colorListening)" />
                        <Area type="monotone" dataKey="game" name="Game" stroke="#10b981" fillOpacity={0.1} fill="#10b981" />
                        <Area type="monotone" dataKey="mastered" name="Mastered" stroke="#f97316" fillOpacity={0.1} fill="#f97316" />
                    </AreaChart>
                );
            case 'pie':
                const COLORS = ['#3b82f6', '#f59e0b', '#a855f7', '#10b981', '#f97316'];
                const pieData = [
                    { name: 'Vocab', value: data.reduce((sum, d) => sum + (d.vocab || 0), 0) },
                    { name: 'Learn', value: data.reduce((sum, d) => sum + (d.learn || 0), 0) },
                    { name: 'Listen', value: data.reduce((sum, d) => sum + (d.listening || 0), 0) },
                    { name: 'Game', value: data.reduce((sum, d) => sum + (d.game || 0), 0) },
                    { name: 'Mastered', value: data.reduce((sum, d) => sum + (d.mastered || 0), 0) },
                ].filter(d => d.value > 0);
                return (
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                );
            case 'bar':
            default:
                return (
                    <BarChart {...commonProps} barGap={2}>
                        <CartesianGrid vertical={false} stroke="var(--border-light)" strokeDasharray="3 3" opacity={0.5} />
                        <XAxis dataKey="day" {...axisProps} dy={10} interval={0} />
                        {renderYAxis()}
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-hover)', opacity: 0.5 }} />
                        <Bar dataKey="vocab" name="Added" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Bar dataKey="learn" name="Learn" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Bar dataKey="listening" name="Listen" fill="#a855f7" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Bar dataKey="game" name="Game" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Bar dataKey="mastered" name="Mastered" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                );
        }
    };

    return (
        <div className="w-full h-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
            </ResponsiveContainer>
        </div>
    );
};

export default StreakChart;
