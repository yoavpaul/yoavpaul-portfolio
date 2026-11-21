// Makes a video smaller for the website (built into macOS, nothing to install).
// The new video: H.264 MP4, no sound (the site plays its loops muted),
// at most <max height> pixels high, at a chosen bitrate (megabits per second).
// It also saves the first frame as a JPG, to use as the video's "poster"
// (the picture that shows until the video starts).
//
// Use:  swift tools/compress-video.swift <in.mp4> <out.mp4> <poster.jpg> <max height> <megabits per second>

import AVFoundation
import CoreImage
import AppKit

let args = CommandLine.arguments
guard args.count == 6, let maxHeight = Double(args[4]), let mbps = Double(args[5]) else {
  print("use: compress-video.swift in out poster maxHeight mbps"); exit(1)
}
let input = URL(fileURLWithPath: args[1])
let output = URL(fileURLWithPath: args[2])
let posterURL = URL(fileURLWithPath: args[3])
try? FileManager.default.removeItem(at: output)

let asset = AVURLAsset(url: input)
let track = asset.tracks(withMediaType: .video)[0]
let size = track.naturalSize.applying(track.preferredTransform)
let sourceW = abs(size.width), sourceH = abs(size.height)
let scale = min(1, maxHeight / Double(sourceH))
// The sizes must be even numbers
let outW = Int(Double(sourceW) * scale / 2) * 2
let outH = Int(Double(sourceH) * scale / 2) * 2

// Reading: the frames come out already shrunk to the new size
let composition = AVMutableVideoComposition(propertiesOf: asset)
composition.renderSize = CGSize(width: outW, height: outH)
let instruction = AVMutableVideoCompositionInstruction()
instruction.timeRange = CMTimeRange(start: .zero, duration: asset.duration)
let layer = AVMutableVideoCompositionLayerInstruction(assetTrack: track)
layer.setTransform(track.preferredTransform.concatenating(CGAffineTransform(scaleX: scale, y: scale)), at: .zero)
instruction.layerInstructions = [layer]
composition.instructions = [instruction]

let reader = try AVAssetReader(asset: asset)
let readerOutput = AVAssetReaderVideoCompositionOutput(videoTracks: [track], videoSettings: [
  kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA])
readerOutput.videoComposition = composition
reader.add(readerOutput)

// Writing: H.264 at the chosen bitrate
let writer = try AVAssetWriter(outputURL: output, fileType: .mp4)
writer.shouldOptimizeForNetworkUse = true // can start playing before it has fully loaded
let writerInput = AVAssetWriterInput(mediaType: .video, outputSettings: [
  AVVideoCodecKey: AVVideoCodecType.h264,
  AVVideoWidthKey: outW, AVVideoHeightKey: outH,
  AVVideoCompressionPropertiesKey: [
    AVVideoAverageBitRateKey: Int(mbps * 1_000_000),
    AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel]])
writer.add(writerInput)

reader.startReading()
writer.startWriting()
writer.startSession(atSourceTime: .zero)
var savedPoster = false
while let sample = readerOutput.copyNextSampleBuffer() {
  if !savedPoster, let buffer = CMSampleBufferGetImageBuffer(sample) {
    let rep = NSBitmapImageRep(ciImage: CIImage(cvPixelBuffer: buffer))
    try rep.representation(using: .jpeg, properties: [.compressionFactor: 0.85])!.write(to: posterURL)
    savedPoster = true
  }
  while !writerInput.isReadyForMoreMediaData { usleep(1000) }
  writerInput.append(sample)
}
writerInput.markAsFinished()
let done = DispatchSemaphore(value: 0)
writer.finishWriting { done.signal() }
done.wait()
print("\(output.lastPathComponent): \(outW)x\(outH), status \(writer.status.rawValue) \(writer.error?.localizedDescription ?? "")")
